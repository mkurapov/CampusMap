import csv
import json
from datetime import datetime

cleanData = []

def massageDate(rowDate):
    # string = '31-10-2012 4:31'
    dt = datetime.strptime(rowDate, '%d-%m-%Y %H:%M')
    dt = dt.replace(month=1, day=1, year=1900)
    # return dt.strftime("%H:%M")
    return dt

def resetPath(path):
    return {
        'id': -1,
        'coords':[],
        # 'startTime':{}
        # 'endTime':''
    }

with open('data/paths-full.csv', newline='') as csvfile:
    rows = csv.DictReader(csvfile)
    

    currentPath = {
        'id': -1,
        # 'startTime':{}
        'coords':[],
        # 'startTime':'',
        # 'endTime':''
    }

    # previousTime = ''

    for index, row in enumerate(rows):
        rowId = row['Path_ID']

        if (rowId != currentPath['id']):
            # currentPath['endTime'] = previousTime
            cleanData.append(currentPath)
            currentPath = resetPath(currentPath)
            currentPath['id'] = rowId
            currentPath['startTime'] = massageDate(row['Loct'])

        # previousTime = row['Loct']

        coords = [
            float(row['Lon']), float(row['Lat'])
        ]    
    
        currentPath['coords'].append(coords)
    
    cleanData.pop(0)
    cleanData.sort(key=lambda x: x['startTime'])

    
    # cleanData = p=cleanDatap[]
    for index, row in enumerate(cleanData):
        row['startTime'] = row['startTime'].strftime("%H:%M")

    with open('data/paths.json', 'w') as fp:
        datadump = {
            "data": cleanData
        }
        json.dump(datadump, fp)
