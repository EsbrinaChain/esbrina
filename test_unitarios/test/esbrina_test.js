const assert = require('assert');
const ganache = require('ganache');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const { abi, bytecode } = require("../compile");


console.log(abi);
console.log(bytecode);

let accounts;
let esbrinachain;

describe("Esbrinachain tests", () => {
    
    before("Obtener cuentas en la red: ", async () => {
        accounts = await web3.eth.getAccounts();
        console.log(accounts);
        esbrinachain = await new web3.eth.Contract(abi).
            deploy({ data: bytecode, arguments: [] }).
            send({ from: accounts[0], gas: 10000000 });
        console.log('Dirección del contrato: ',esbrinachain.options.address);
    });
    it("Desplegar contrato", () => {
        console.log('Dirección del contrato: ', esbrinachain.options.address);
        assert.ok(esbrinachain.options.address);
    });

    it('Crear pregunta', async () => {
        const enunciado = "De qué color tienen los ojos los delfines?";
        const autor = "user1@gmail.com";
        await esbrinachain.methods.creaPregunta(enunciado, autor,"","").send({ from: accounts[1], value:10, gas:7000000 }).
            on('transactionHash', (transactionHash) => { console.log('TxId:', transactionHash); }).
            then((receipt) => { console.log("Receipt: ", receipt); });
        const pregunta = await esbrinachain.methods.preguntas(1).call();
        assert.equal(pregunta.enunciado,enunciado,"Enunciado de la pregunta 1 no se ha registrado!");
        assert.equal(pregunta.autor, accounts[1], "autor de la pregunta 1 no se ha registrado!");
        
    });
    
    it('Crear respuesta', async () => {
        const enunciado = "Verdes y azules?";
        const autor = "user2@gmail.com";
        const haRespondidoAPreg = await esbrinachain.methods.calcAdrRespuestasAPregunta(1, accounts[2]).call();
        assert.notEqual(haRespondidoAPreg,true,"No se puede responder más de una vez una pregunta.");
        await esbrinachain.methods.creaRespuesta(1,enunciado, autor,"","").send({ from: accounts[2], gas:7000000 }).
            on('transactionHash', (transactionHash) => { console.log('TxId:', transactionHash); }).
            then((receipt) => { console.log("Receipt: ", receipt); });
        const pregunta = await esbrinachain.methods.preguntas(1).call();
        assert.notEqual(pregunta.autor,accounts[2],"El autor de la pregunta es el autor de la respuesta.");
        const resp1 = await esbrinachain.methods.preg_resp(1, 1).call();
        assert.equal(resp1.autor, accounts[2], "El autor de la respuesta no ha quedado registrado.");
    });

    it('Inicio del periodo de Votación (caso admin)', async () => {
        const pregunta = await esbrinachain.methods.preguntas(1).call();
        assert.equal(pregunta.estado, 0, "La pregunta ha de estar 'abierta' para poder pasar a 'votando'.");
        try {
            await esbrinachain.methods.iniciaVotacion(1).send({ from: accounts[0], gas: 7000000 }).
                on('transactionHash', (transactionHash) => { console.log('TxId:', transactionHash); }).
                then((receipt) => { console.log("Receipt: ", receipt); });
            
        } catch(error) {
            console.log(error.message);
        }
        const admin = await esbrinachain.methods._admin().call();
        assert.equal(accounts[0],admin,"Solo el administrador del sistema puede iniciar la votación manualmente.")
        const tieneRespuestas = await esbrinachain.methods.calcRespAPreg(1).call();
        assert.notEqual(tieneRespuestas.length, 0, "La pregunta no tiene respuestas que votar.");
        
        const resp1 = await esbrinachain.methods.preg_resp(1, 1).call();
        assert.equal(resp1.autor, accounts[2], "El autor de la respuesta no ha quedado registrado.");

        assert.equal(pregunta.estado, 0, "La pregunta NO estaba en estado 0 (abierta)");
        const pregunta1 = await esbrinachain.methods.preguntas(1).call();
        assert.equal(pregunta1.estado, 1, "La pregunta ahora no está en estado 1 (votando)");

    });

    it("Votar una respuesta de una pregunta en periodo de Votación", async () => {
        const pregunta = await esbrinachain.methods.preguntas(1).call();
        assert.equal(pregunta.estado, 1, "La pregunta ha de estar en estado 'votando'.");
        assert.ok(pregunta.votada == false, "Para poder votar una pregunta no puede haberse resuelto la votación (votada=true)");
        const usuario = await esbrinachain.methods.usuarios(accounts[2]).call();
        assert.ok(usuario.vetado == false, "Para poder votar una pregunta el usuario no debe estar vetado.");
        const haRespondidoAPreg = await esbrinachain.methods.calcAdrRespuestasAPregunta(1, accounts[3]).call();
        assert.notEqual(haRespondidoAPreg, true, "No se puede VOTAR una pregunta si se es autor de una respuesta.");
        assert.notEqual(pregunta.autor, accounts[3], "El creador de la pregunta no la puede votar.");
        try {
            await esbrinachain.methods.votarRespuesta(1,1).send({ from: accounts[3], gas: 7000000 }).
                on('transactionHash', (transactionHash) => { console.log('TxId:', transactionHash); }).
                then((receipt) => { console.log("Receipt: ", receipt); });

        } catch (error) {
            console.log(error.message);
        }
    });

    it('Final del periodo de Votación (caso admin)', async () => {
        const pregunta = await esbrinachain.methods.preguntas(1).call();
        assert.equal(pregunta.estado, 1, "La pregunta ha de estar en estado 'votando' para poder pasar a 'consulta'.");
        try {
            await esbrinachain.methods.finalizaVotacion(1).send({ from: accounts[0], gas: 7000000 }).
                on('transactionHash', (transactionHash) => { console.log('TxId:', transactionHash); }).
                then((receipt) => { console.log("Receipt: ", receipt); });
            
        } catch(error) {
            console.log(error);
        }
        const admin = await esbrinachain.methods._admin().call();
        assert.equal(accounts[0],admin,"Solo el administrador del sistema puede FINALIZAR la votación manualmente.")

        assert.equal(pregunta.estado, 1, "La pregunta NO estaba en estado 1 (votando)");
        const pregunta1 = await esbrinachain.methods.preguntas(1).call();
        assert.equal(pregunta1.estado, 2, "La pregunta ahora no está en estado 2 (consulta)");

    });

    it('Resolucion del ganador/res de la votacion', async () => {
        let pregunta = await esbrinachain.methods.preguntas(1).call();
        assert.notEqual(pregunta.estado, 3, "La pregunta está anulada.");
        assert.ok(pregunta.votada==true,"Para resolver la votación la pregunta debe estar votada (campo votada=true)");
        const respAntesVoto = await esbrinachain.methods.preg_resp(1, 1).call();
        assert.equal(respAntesVoto.autor, accounts[2], "El autor de la respuesta no ha quedado registrado.");
        const votos = respAntesVoto.votos;
        const usuarioAntes = await esbrinachain.methods.usuarios(accounts[2]).call();

        try {
            await esbrinachain.methods.votarRespuesta(1,1).send({ from: accounts[4], gas: 7000000 }).
                on('transactionHash', (transactionHash) => { console.log('TxId:', transactionHash); }).
                then((receipt) => { console.log("Receipt: ", receipt); });

        } catch (error) {
            console.log(error.message);
        }

        const respDespuesVoto = await esbrinachain.methods.preg_resp(1, 1).call();
        assert.ok(respAntesVoto.votos == respDespuesVoto.votos, "La resolución de la votación no se ha producido, el voto se ha contabilizado.");
        const usuarioDesp = await esbrinachain.methods.usuarios(accounts[2]).call();
        assert.notEqual(usuarioAntes.prestigio, usuarioDesp.prestigio, "El usuario ganador no ha incrementado su reputación.");

    });
    




 });

