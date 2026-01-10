#!/bin/bash

args=(
  --location
  --max-redirs -1
  --header "X-OSMB-Api-Key: $OSM_BOUNDARIES_API_KEY"
)

japan_id="-382313"
us_id="-148838"
all_ids=(
  -382313
  -148838
  -303427
  -3263728
  -53292
  -192756
  -9407
  -195267
  -2177161
  -536900
  -286393
  -364066
  -80500
  -16239
  -364110
  -547469
  -378734
  -184640
  -547511
  -59065
  -52411
  -287827
  -192784
  -1993208
  -184629
  -252645
  -2528142
  -1889339
  -59470
  -1993867
  -285454
  -2103120
  -186382
  -192783
  -195269
  -49898
  -192830
  -1428125
  -535774
  -2185366
  -192790
  -2361304
  -167454
  -270056
  -120027
  -535790
  -192794
  -2184233
  -287667
  -192779
  -214885
  -307833
  -307787
  -51684
  -192795
  -50046
  -192801
  -307823
  -307828
  -305142
  -108089
  -1473947
  -1520612
  -192791
  -296961
  -79510
  -88210
  -192800
  -2185374
  -52939
  -571802
  -571747
  -54224
  -2202162
  -192793
  -28699
  -51477
  -192781
  -1278736
  -192307
  -2184073
  -550727
  -1521463
  -270009
  -192778
  -192776
  -287083
  -307829
  -287670
  -21335
  -299133
  -304716
  -304751
  -304938
  -304934
  -62273
  126470842
  -17893358
  -17893359
  626244000
  126470877
  23623225
  -17893357
  -62269
  10663197
  -1473946
  -365331
  -555017
  -367988
  -184818
  -214665
  -192798
  -571178
  -2088990
  -305099
  -178009
  -49903
  -72594
  -184843
  -2093234
  -192780
  -192758
  -1155955
  -72596
  -2171347
  -447325
  -195290
  -2108121
  -536773
  -192785
  -365307
  -571771
  -192763
  -535828
  -114686
  -58974
  -1124039
  -161033
  -53296
  -537257
  -3630439
  -195273
  -50371
  -195266
  -571804
  -184633
  -2323309
  -556706
  -287666
  -192786
  -192787
  -1558556
  -192734
  -53293
  -2978650
  -305138
  -307573
  -571805
  -287668
  -307866
  -287077
  -288247
  -443174
  -2185375
  -49715
  -295480
  -305095
  -90689
  -60189
  -171496
  -5441968
  -1964272
  -536899
  -550728
  -550725
  -1872673
  -54624
  -535880
  -307584
  -192775
  -1741311
  -536765
  -192777
  -536780
  -14296
  -218657
  -1857436
  -192799
  -87565
  -1983628
  -307756
  -1656678
  -1311341
  -536807
  -192789
  -287082
  -52822
  -51701
  -184840
  -449220
  -214626
  -195270
  -2067731
  -192774
  -192782
  -2186600
  -2186665
  -555717
  -192757
  -174737
  -223026
  -547479
  -2177266
  -192796
  -60199
  -307763
  -62149
  -287072
  -196240
  -2177246
  -36989
  -272644
  -49915
  -305092
  -195271
  -195272
)

common_opts="db=osm20251201&recursive=true&boundary=administrative&format=GeoJSON&srid=4326&landOnly=true&includeAllTags=true&includeHierarchyField=true&simplify=0.0001"

mkdir -p tmp

function check_osm_api_key () {
  if [[ -z "$OSM_BOUNDARIES_API_KEY" ]]; then
    echo "must provide OSM_BOUNDARIES_API_KEY";
    exit -1
  fi
}

function download_osm_boundaries () {
  if ! [[ -f $3.gz ]]; then
    check_osm_api_key
    curl "${args[@]}" \
      -o $3.gz \
      "https://osm-boundaries.com/api/v1/download?&osmIds=$1&minAdminLevel=$2&maxAdminLevel=$2&$common_opts" || exit -1
    gunzip -k $3.gz
    echo "Downloaded $(jq '.features | length' $3) features to $3"
  fi
}

function download_world_boundaries () {
  batch=0
  batch_size=64
  index=0
  while [[ $index -lt ${#all_ids[@]} ]]; do
    batch_ids=$(echo "${all_ids[@]:$index:$batch_size}" | sed 's/ /%2C/g')

    gz_out=$1.$batch.geojson.gz
    json_out=$1.$batch.geojson
    if ! [[ -f $gz_out ]]; then
      check_osm_api_key
      curl -X QUERY "${args[@]}" \
        -o $gz_out \
        "https://osm-boundaries.com/api/v1/download?osmIds=$batch_ids&minAdminLevel=2&maxAdminLevel=2&$common_opts" || exit -1
      gunzip -k $gz_out
      echo "Downloaded $(jq '.features | length' $json_out) features to $json_out"
    fi

    index=$((index + batch_size))
    batch=$((batch + 1))
  done
}

download_world_boundaries tmp/raw_world2
download_osm_boundaries $japan_id 4 tmp/raw_japan4.geojson
download_osm_boundaries $japan_id 7 tmp/raw_japan7.geojson
download_osm_boundaries $us_id 4 tmp/raw_us4.geojson

function simplify_geometry () {
  filename=$(basename $1)
  dst=tmp/simp_${filename:4}
  if ! [[ -f $dst ]]; then
    geo2topo all=$1 | toposimplify -p $2 | topo2geo all=$dst
    echo "Simplified $(jq '.features | length' $dst) features into $dst"
  fi
}

for file in tmp/raw_world2.*.geojson; do
  simplify_geometry $file 1e-2
done
geojson-merge tmp/simp_world2.*.geojson > tmp/merged_world2.geojson
echo "Merged $(jq '.features | length' tmp/merged_world2.geojson) features into tmp/merged_world2.geojson"

for file in tmp/raw_*4.geojson; do
  simplify_geometry $file 1e-4
done
geojson-merge tmp/simp_*4.geojson > tmp/merged_world4.geojson
echo "Merged $(jq '.features | length' tmp/merged_world4.geojson) features into tmp/merged_world4.geojson"

cp tmp/raw_japan4.geojson tmp/raw_japan4_detailed.geojson
simplify_geometry tmp/raw_japan4_detailed.geojson 1e-6
cp tmp/simp_japan4_detailed.geojson tmp/merged_world4_detailed.geojson
echo "Merged $(jq '.features | length' tmp/merged_world4_detailed.geojson) features into tmp/merged_world4_detailed.geojson"

for file in tmp/raw_*7.geojson; do
  simplify_geometry $file 1e-6
done
geojson-merge tmp/simp_*7.geojson > tmp/merged_world7.geojson
echo "Merged $(jq '.features | length' tmp/merged_world7.geojson) features into tmp/merged_world7.geojson"

for file in tmp/merged_*.geojson; do
  dst=tmp/labeled_${file:11}
  cat $file | python3 transform_data.py > $dst
  echo "Labeled $(jq '.features | length' $dst) features into $dst"
done

geo2topo \
  level2=tmp/labeled_world2.geojson \
  level4=tmp/labeled_world4.geojson \
  level7=tmp/labeled_world7.geojson \
  level4_detailed=tmp/labeled_world4_detailed.geojson \
  | gzip > data.topojson.gz
