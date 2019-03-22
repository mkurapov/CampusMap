const socket = io('http://localhost:8000');

socket.on('connect', () => {
    console.log('Connected'); // true

    socket.emit('client_connect', {
        username: 'fred',
        platform: 'js'
    });
});


socket.on('Building Found', msg => {
    const bid = mapBuildingValToId(msg.fields.filter(f => f.key == "building_name")[0].value);
    selectBuilding(bid);
})

socket.on('Building Lost', msg => {
    const bid = mapBuildingValToId(msg.fields.filter(f => f.key == "building_name")[0].value);
    deselectBuilding(bid);
});


function mapBuildingValToId(bval) {
    if (bval == "Energy.Enviroment.Experiential Learning") {
       return 'EEEL';
    } else {
        return 'MS';
    }
}