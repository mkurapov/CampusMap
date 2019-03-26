import csv
import json

geojson = {}

with open('data/paths.json', 'r') as fp:
    jsonFile = json.load(fp)
    data = jsonFile['data']
    features = []

    for i, d in enumerate(data):
        
        obj = {
            "type": "Feature",
            "geometry" : {
                "type": "LineString",
                "coordinates": d["coords"]
                },
            "properties" : { "id": d["id"], "bids": d["bids"], "startTime": d["startTime"] },
        }
        features.append(obj)
        print(i)
        
    geojson = {
    "type": "FeatureCollection",
        "features": features
    }
        



with open('data/geopaths.json', 'w') as fp:
    json.dump(geojson, fp)

# { "type": "LineString", "coordinates": [[0, 0], [10, 10]] }

