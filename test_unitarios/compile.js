const path = require('path');
const fs = require('fs');
const solc = require('solc');



const contrato1Path = path.resolve(__dirname, 'contracts', 'esb_preguntas.sol');
const contrato2Path = path.resolve(__dirname, 'contracts', 'esb_respuestas.sol');
const contrato3Path = path.resolve(__dirname, 'contracts', 'esbrinachain.sol');

const source1 = fs.readFileSync(contrato1Path, 'UTF-8');
const source2 = fs.readFileSync(contrato2Path, 'UTF-8');
const source3 = fs.readFileSync(contrato3Path, 'UTF-8');

//console.log(contratosPath);
//console.log(source);

var input = {
    language: 'Solidity',
    sources: {
        'esb_preguntas.sol' : {
            content: source1
        },
        'esb_respuestas.sol' : {
            content: source2
        },
        'esbrinachain.sol' : {
            content: source3
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
}; 

//console.log(JSON.parse(solc.compile(JSON.stringify(input))));
//console.log(JSON.parse(solc.compile(JSON.stringify(input))).contracts['esbrinachain.sol']['esbrinachain']);

//pas 2  exportar para test
const contrato_compile = JSON.parse(solc.compile(JSON.stringify(input))).contracts['esbrinachain.sol']['esbrinachain'];

//console.log("\nABI:" + contrato_compile.abi);
//console.log("\bytecode:" + contrato_compile.evm);

module.exports = {
	abi : contrato_compile.abi,
	bytecode : contrato_compile.evm.bytecode.object
}

