const socket = io('http://localhost:8000');

socket.on('connect', () => {
    console.log('Connected'); // true

    socket.emit('client_connect', {
        username: 'fred',
        platform: 'js'
    });
});1


socket.on('Building Found', msg => {
    const bid = mapBuildingValToId(msg.fields.filter(f => f.key == "building_name")[0].value);
    selectBuilding(bid);
})

socket.on('Building Lost', msg => {
    const bid = mapBuildingValToId(msg.fields.filter(f => f.key == "building_name")[0].value);
    deselectBuilding(bid);
});


function mapBuildingValToId(bval) {
    return buildingMap[bval] ? buildingMap[bval] : '';
}

const buildingMap = {
    'Energy.Enviroment.Experiential Learning': 'EEEL',
    'Math Science':'MS',
    'Biological Science': 'BI',
    'Cascade Hall':'CD',
    'Art Building':'AB',
    'Olympic Oval': 'OO'
}