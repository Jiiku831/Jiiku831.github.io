import json
import sys

data = json.load(sys.stdin)
for feature in data["features"]:
  try:
    lat = feature["properties"]["label_node_lat"]
    lng = feature["properties"]["label_node_lng"]
  except KeyError:
    pass
  if not lat or not lng:
    try:
      lat = feature["properties"]["admin_centre_node_lat"]
      lng = feature["properties"]["admin_centre_node_lng"]
    except KeyError:
      pass
  if not lat or not lng:
    try:
      lat = feature["geometry"]["coordinates"][0][0][0][1]
      lng = feature["geometry"]["coordinates"][0][0][0][0]
      sys.stderr.write(
          f"WARN: No center: {feature['properties']}\n");
    except (KeyError, IndexError):
      pass
  if not lat or not lng:
    sys.stderr.write(
        f"ERROR: No position: {feature['properties']}\n");
  else:
    feature["properties"]["label_pos"] = [lat, lng]
json.dump(data, sys.stdout)
