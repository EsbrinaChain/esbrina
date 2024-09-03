//SPDX-License-Identifier:GPL-3.0
pragma solidity <0.9;

import "./esb_preguntas.sol";

contract responder is preguntar {
    uint public tiempo_respuesta = 1 weeks;
    uint public cupo_respuestas = 15;
    uint public total_resp;

    struct Respuesta {
        uint id_resp;
        uint id_preg;
        uint votos;
        address autor;
        string enunciado;
        bool ganadora;
    }

    mapping(uint => mapping(uint => Respuesta)) public preg_resp;
    mapping(uint => uint) public pregNumResp;

    event InicioVotacion(uint indexed id_preg);
    event RespuestaCreada(
        uint indexed id_preg,
        uint indexed id_resp,
        address indexed autor
    );
    event RespuestaFueraDeTiempo(
        uint indexed idx_preg,
        uint indexed id_resp,
        address indexed autor
    );
    event RespuestaFueraDeCupo(
        uint indexed idx_preg,
        uint indexed cupo_max,
        address indexed autor
    );
    event PreguntaAnulada(uint indexed id_preg, string motivo);

    // Mira si un usuario a respondido ya a una pregunta
    function calcAdrRespuestasAPregunta(
        uint id_preg,
        address _adr
    ) public view returns (bool _existe) {
        _existe = false;
        for (uint i = 1; i <= pregNumResp[id_preg]; i++) {
            if (preg_resp[id_preg][i].autor == _adr) _existe = true;
        }
    }
    // devuelve el conjunto de respuestas a una pregunta
    function calcRespAPreg(uint id_preg) public view returns (uint[] memory) {
        uint[] memory _resp = new uint[](pregNumResp[id_preg]);
        for (uint i = 1; i <= pregNumResp[id_preg]; i++) {
            _resp[i - 1] = preg_resp[id_preg][i].id_resp;
        }
        return _resp;
    }
    
    function adrRespondeVence(uint idx_preg, address _adr) internal view returns (bool, bool) {
        if (preguntas[idx_preg].estado == estado_preg.consulta) {
            uint[] memory rsp = calcRespAPreg(idx_preg);
            for (uint i = 1; i < rsp.length + 1; i++) {
                if (
                    preg_resp[idx_preg][i].ganadora &&
                    preg_resp[idx_preg][i].autor == _adr
                ) {
                    return (true, true);
                }
                if (
                    !preg_resp[idx_preg][i].ganadora &&
                    preg_resp[idx_preg][i].autor == _adr
                ) {
                    return (true, false);
                }
            }
        }
        return (false, false);
    }
    // Para consultar la respuesta mas votada de una pregunta se debe enviar el 50% de su recompensa
    // excepto que sea el autor de la pregunta que podrá consultarla sin coste.
    function consultaRespuestaVotada(uint idx_preg) public payable returns(uint){
        string memory estado = estadoPreg(idx_preg);
        require(preguntas[idx_preg].estado == estado_preg.consulta,
        string(abi.encodePacked("La pregunta debe ser consultable, pero su estado es ",estado)));
        uint precio = preguntas[idx_preg].recompensa / 2;
        if (msg.sender != preguntas[idx_preg].autor){
            require(msg.value >= precio,"Se debe enviar el coste de la consulta para ver la respuesta votada");
        }
        return RespMasVotada(idx_preg);     
    }

    // Devuelve un array con la opción más votada o opciones en caso de empate.
    function RespMasVotada(uint idx_preg) internal view returns(uint _votada){
        if(preguntas[idx_preg].estado == estado_preg.consulta){
            uint[] memory rsp = calcRespAPreg(idx_preg);
            for (uint i=1; i < rsp.length+1; i++){
                if(preg_resp[idx_preg][i].ganadora){
                    _votada = i;
                }
            }
        }
        return _votada;
    }

    function creaRespuesta(
        uint id_preg,
        string memory texto,
        string memory nombre,
        string memory apellidos,
        string memory alia
    ) public {
        require(total_preg > 0, "No existen preguntas en en el sistema.");
        require(
            preguntas[id_preg].creada > 0,
            "No existe una pregunta con Fecha de creacion 0."
        );
        require(
            preguntas[id_preg].estado == estado_preg.abierta,
            "La pregunta ya no puede recibir respuestas porque NO esta abierta."
        );
        uint num_resp_act = calcRespAPreg(id_preg).length;
        // Pasado el periodo de respuestas, si no se han proporcionado se anula la pregunta.
        if (
            num_resp_act == 0 &&
            (block.timestamp - preguntas[id_preg].creada) >= tiempo_respuesta
        ) {
            preguntas[id_preg].estado = estado_preg.anulada;
            emit PreguntaAnulada(id_preg, "Anulada por falta de respuestas.");
            return;
        }
        if (block.timestamp - preguntas[id_preg].creada >= tiempo_respuesta) {
            preguntas[id_preg].estado = estado_preg.votando;
            preguntas[id_preg].fecha_votacion = block.timestamp;
            emit RespuestaFueraDeTiempo(
                id_preg,
                (block.timestamp - preguntas[id_preg].creada) % 86400,
                preguntas[id_preg].autor
            );
            emit InicioVotacion(id_preg);
        } else if (num_resp_act >= cupo_respuestas) {
            preguntas[id_preg].estado = estado_preg.votando;
            preguntas[id_preg].fecha_votacion = block.timestamp;
            emit RespuestaFueraDeCupo(
                id_preg,
                cupo_respuestas,
                preguntas[id_preg].autor
            );
            emit InicioVotacion(id_preg);
        } else {
            // El usuario no debe estar vetado
            require(!usuarios[msg.sender].vetado, "El usuario esta vetado.");
            // El autor de la respuesta no puede ser el autor de la pregunta
            require(
                preguntas[id_preg].autor != msg.sender,
                "El usuario autor no puede responder a sus preguntas."
            );
            // El usuario solo puede responder 1 vez a una pregunta
            require(
                !calcAdrRespuestasAPregunta(id_preg, msg.sender),
                "No se puede responder mas de 1 vez."
            );
            // Si no es usuario tenemos que recibir un nombre o un apellido o un alias
            if (!usuarios[msg.sender].existe) {
                require(
                    keccak256(abi.encodePacked(nombre)) !=
                        keccak256(abi.encodePacked("")) ||
                        keccak256(abi.encodePacked(apellidos)) !=
                        keccak256(abi.encodePacked("")) ||
                        keccak256(abi.encodePacked(alia)) !=
                        keccak256(abi.encodePacked("")),
                    "Hace falta indicar nombre o apellidos o alias."
                );
                total_usuarios++;
                usuarios[msg.sender] = Usuario(
                    nombre,
                    apellidos,
                    alia,
                    false,
                    true,
                    0
                );
            }
            total_resp++;
            pregNumResp[id_preg]++;
            preg_resp[id_preg][pregNumResp[id_preg]] = Respuesta(
                pregNumResp[id_preg],
                id_preg,
                0,
                msg.sender,
                texto,
                false
            );
            emit RespuestaCreada(id_preg, pregNumResp[id_preg], msg.sender);
        }
    }
}




