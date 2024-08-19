const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

// Load the Protobuf file
const packageDefinition = protoLoader.loadSync(path.join(__dirname, './a.proto'));
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

// Access the service correctly
const AddressBookService = protoDescriptor.AddressBookService;
const PERSONS = [
    { name: "priyam", age: 24 },
    { name: "anand", age: 45 }
];

// Implement the gRPC methods
//call is like req of https and callback is like response
function addPerson(call, callback) {
    console.log("call is",call);
    let person = {
        name: call.request.name,
        age: call.request.age
    };
    PERSONS.push(person);
    callback(null, person);
    //null,person means no error and returns person
}

function getPersonByName(call, callback) {
    const person = PERSONS.find(p => p.name === call.request.name);
    if (person) {
        callback(null, person);
    } else {
        callback({
            code: grpc.status.NOT_FOUND,
            details: 'Person not found'
        });
    }
}

// Create a new gRPC server
const server = new grpc.Server();

//it is for mapping of client methods with server method(a.proto)
// Add the service to the server
server.addService(AddressBookService.service, {
    AddPerson: addPerson,
    GetPersonByName: getPersonByName
});

// Bind the server to a port and start it
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    console.log('Server running at http://0.0.0.0:50051');
    server.start();
});
