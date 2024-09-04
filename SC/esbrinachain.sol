//SPDX-License-Identifier:GPL-3.0
pragma solidity <0.9;

import "./esb_respuestas.sol";

contract esbrinachain is responder {
    uint public tiempo_votacion = 1 weeks;

    event FinalVotacion(uint indexed id_preg, address indexed autor, uint indexed respGanadora);

    // address usuario, mapeo id_preg_votada, id_resp_votada
    mapping(address => mapping(uint => uint)) public votaciones;
    address[] private usr_premio_mensual;

    // Devuelve valores variables globales
    function valoresVariables()
        public
        view
        returns (uint, uint, uint, uint, uint, uint)
    {
        return (
            tiempo_respuesta,
            tiempo_votacion,
            cupo_respuestas,
            total_preg,
            total_resp,
            num_incr_recompensa
        );
    }

    function votarRespuesta(uint idx_preg, uint idx_resp) public {
        if (
            (block.timestamp - preguntas[idx_preg].fecha_votacion) >=
            tiempo_votacion
        ) {
            require(
                preguntas[idx_preg].estado == estado_preg.votando,
                "La pregunta no se puede VOTAR."
            );
            preguntas[idx_preg].estado = estado_preg.consulta;
            if (preguntas[idx_preg].votada) {
                // Resolucion votación
                resolucionVotacion(idx_preg);
                emit FinalVotacion(idx_preg, preguntas[idx_preg].autor, RespMasVotada(idx_preg));
            } else {
                preguntas[idx_preg].estado = estado_preg.anulada;
                emit PreguntaAnulada(
                    idx_preg,
                    "Pregunta anulada por falta de votaciones"
                );
            }
        } else {
            // El estado de la pregunta tiene que estar en 'Votando'
            require(
                preguntas[idx_preg].estado == estado_preg.votando,
                "La pregunta no se puede VOTAR."
            );
            // El usuario no debe estar vetado
            require(!usuarios[msg.sender].vetado, "El usuario esta vetado.");
            // El autor de la pregunta no puede votarla
            require(
                preguntas[idx_preg].autor != msg.sender,
                "El autor no puede VOTAR sus preguntas."
            );
            // como solo puede votar 1 vez no debe existir un elemento dado una address y un id_preg
            require(
                votaciones[msg.sender][idx_preg] == 0,
                "Un usuario solo puede votar 1 vez una pregunta."
            );
            uint[] memory rsp = calcRespAPreg(idx_preg);
            require(
                preguntas[idx_preg].creada != 0,
                "No existe una pregunta con este ID."
            );
            require(
                idx_resp > 0 && idx_resp <= rsp[rsp.length - 1],
                "No existe ese ID de respuesta para esa pregunta."
            );
            preg_resp[idx_preg][idx_resp].votos++;
            preguntas[idx_preg].votada = true;
            votaciones[msg.sender][idx_preg] = idx_resp;
        }
    }

    function resolucionVotacion(uint idx_preg) internal {
        uint[] memory rsp = calcRespAPreg(idx_preg);
        if (rsp.length == 0) {
            preguntas[idx_preg].estado = estado_preg.anulada;
        } else {
            uint max=0; 
            for (uint i = 1; i < rsp.length; i++) {
                if (preg_resp[idx_preg][i].votos <=  preg_resp[idx_preg][i+1].votos) {
                    max=preg_resp[idx_preg][i+1].votos;
                }
                else{
                    max=preg_resp[idx_preg][i].votos;
                }
            }
            uint j=0;
            for (uint i = 1; i <= rsp.length; i++) {
                if(preg_resp[idx_preg][i].votos == max){
                    preg_resp[idx_preg][i].ganadora=true;
                    j++;
                }
            }
        resolucionPagosBeneficios(idx_preg, rsp.length, j);
      }
    }
    // Pago de la recompensa al ganador/ganadores con la respuesta más votada.
    // En caso de varios ganadores el premio se divide entre todos a partes iguales.
    function resolucionPagosBeneficios(
        uint idx_preg,
        uint num_resp,
        uint conPremio
    ) internal {
        uint pago = preguntas[idx_preg].recompensa / conPremio;
        for (uint i = 1; i <= num_resp; i++) {
            if (preg_resp[idx_preg][i].ganadora) {
                payable(preg_resp[idx_preg][i].autor).transfer(pago);
                calcPrestigio(preg_resp[idx_preg][i].autor);
            }
        }
    }
    // El administrador puede iniciar la votación de cualquier pregunta.
    function iniciaVotacion(uint idx_preg) public soloAdmin {
        require(
            preguntas[idx_preg].estado == estado_preg.abierta,
            "La pregunta no esta abierta."
        );
        require(
            calcRespAPreg(idx_preg).length > 0,
            "No se han dado respuestas a esta pregunta."
        );
        preguntas[idx_preg].estado = estado_preg.votando;
        preguntas[idx_preg].fecha_votacion = block.timestamp - 1 minutes;
    }

    // Función utilizada por el administrador para forzar la finalización de la votación
    // Pero pasado el intervalo de votación el contrato finalizará la votación de una pregunta,
    // cuando se intente votar fuera del periodo de votación.
    function finalizaVotacion(uint idx_preg) public soloAdmin {
        require(
            preguntas[idx_preg].estado == estado_preg.votando,
            "La pregunta no se esta votando."
        );
        preguntas[idx_preg].estado = estado_preg.consulta;
        //preguntas[idx_preg].fecha_votacion = block.timestamp - 2 weeks;
        resolucionVotacion(idx_preg);
    }

    // Función que permite al admin configurar los parámetros del contrato
    function admCfgTiempoRespuesta(
        uint num,
        uint t,
        string memory units
    ) external soloAdmin {
        // 1 Hour	3600 Seconds
        // 1 Day	86400 Seconds
        // 1 Week	604800 Seconds
        // 1 Month (30.44 days)	2629743 Seconds
        // 1 Year (365.24 days)	31556926 Seconds
        uint valor;
        if (
            keccak256(abi.encodePacked(string(units))) ==
            keccak256(abi.encodePacked("m"))
        ) valor = t * 60;
        if (
            keccak256(abi.encodePacked(string(units))) ==
            keccak256(abi.encodePacked("h"))
        ) valor = t * 3600;
        if (
            keccak256(abi.encodePacked(string(units))) ==
            keccak256(abi.encodePacked("d"))
        ) valor = t * 86400;

        if (num == 1) tiempo_respuesta = valor;
        else if (num == 2) tiempo_votacion = valor;
        else {
            if (num == 3) cupo_respuestas = t;
        }
    }

    // Fórmula para el cálculo de prestigio de un usuario en el sistema EsbrinaChain:
    // Prestigio = ((RespuestasAcertadas)*10) / (totalRespuestas)
    // El prestigio califica a un usuario entre 0-10 puntos.
    // en el mejor de los casos.
    // El prestigio solo se incrementa haciendo preguntas o respondiendo. En el primer caso
    // (responder)puntua un 0.1 respecto del total y el segundo un 0.9. Responder mal penaliza bastante.

    function calcPrestigio(address _usr) internal returns (int) {
        require(
            preguntas[1].creada != 0,
            "No existen preguntas en el sistema."
        );
        require(
            preg_resp[1][1].autor != address(0),
            "No existen respuestas en el sistema."
        );
        int venceUsr = 0;
        int noVenceUsr = 0;
        int prestigio = 0;
        for (uint i = 1; i <= total_preg; i++) {
            if (
                preguntas[i].estado == estado_preg.consulta &&
                calcAdrRespuestasAPregunta(i, _usr)
            ) {
                (bool resp, bool vence) = adrRespondeVence(i, _usr);
                if (resp) {
                    if (vence) {
                        venceUsr++;
                    } else noVenceUsr++;
                }
            }
        }
        prestigio += calcPrestigioPreg(venceUsr, noVenceUsr);
        usuarios[_usr].prestigio = prestigio;
        return prestigio;
    }
    function calcPrestigioPreg(
        int venceUsr,
        int noVenceUsr
    ) internal pure returns (int) {
        if (venceUsr + noVenceUsr == 0) return 0;
        else return ((venceUsr) * 10) / (venceUsr + noVenceUsr);
    }
    // 0.0005 ETH aprox. 1.5$
    function consUsrPrestigio(address _usr) external payable returns (int) {
        require(
            preguntas[1].creada != 0,
            "No existen preguntas en el sistema."
        );
        require(
            preg_resp[1][1].autor != address(0),
            "No existen respuestas en el sistema."
        );
        require(
            msg.value >= 0.0005 ether,
            unicode"Para conocer su prestigio debe enviar 0.0005 ETH."
        );
        int venceUsr = 0;
        int noVenceUsr = 0;
        int prestigio = 0;
        for (uint i = 1; i <= total_preg; i++) {
            if (
                preguntas[i].estado == estado_preg.consulta &&
                calcAdrRespuestasAPregunta(i, _usr)
            ) {
                (bool resp, bool vence) = adrRespondeVence(i, _usr);
                if (resp) {
                    if (vence) {
                        venceUsr++;
                    } else noVenceUsr++;
                }
            }
        }
        prestigio += calcPrestigioPreg(venceUsr, noVenceUsr);
        usuarios[_usr].prestigio = prestigio;
        return prestigio;
    }
}
