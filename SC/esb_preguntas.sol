//SPDX-License-Identifier:GPL-3.0
pragma solidity < 0.9;

contract esbAdmin {
    address public _admin;
    constructor(){
        _admin = msg.sender;
    }
    modifier soloAdmin() {
        require(msg.sender == _admin, unicode"Debe ser ADMIN para realizar esta operación.");
        _; 
    }
}

contract preguntar is esbAdmin {
    
    enum estado_preg {abierta, votando, consulta, anulada}
    
    uint constant num_incr_recompensa = 3;
    uint public total_preg;

    event PreguntaCreada(uint indexed _id_preg, address indexed _autor);
    event SubidaRecompensaPreg(uint indexed id_preg);
    event GanadorPregunta(uint indexed id_preg, address[] indexed autor_s);

    struct Usuario {
        string nom;
        string app;
        string aliase;
        bool vetado;
        bool existe;
        int prestigio; 
    }
    struct Pregunta {
        estado_preg estado;
        uint recompensa;
        uint creada;
        uint fecha_votacion;
        address autor;
        string enunciado;
        bool votada;
    }

    uint public total_usuarios;
    mapping (uint=>Pregunta) public preguntas;
    mapping(address => Usuario) public usuarios;

    function creaPregunta(string memory texto, 
                        string memory nombre, string memory apellidos, 
                        string memory alia) public payable {
        require(bytes(texto).length>0,"Enunciado inexistente");
        require(!usuarios[msg.sender].vetado, "El usuario esta vetado.");
        require(msg.value > 0,"No se ha enviado recompensa para resolver la pregunta.");
        if (!usuarios[msg.sender].existe){
            require(bytes(nombre).length>0 || 
                bytes(apellidos).length>0 || 
                bytes(alia).length>0," No se ha facilitado ni nombre, ni apellidos, ni alias.");
            total_usuarios++;
            usuarios[msg.sender] = Usuario(nombre, apellidos, alia, false, true, 0);
        }
        total_preg++;
        preguntas[total_preg] = Pregunta(estado_preg.abierta, msg.value, 
                                         block.timestamp, 0, msg.sender, texto, false); 
        emit PreguntaCreada(total_preg, msg.sender);
        
    }
    
    // Esta función permite a cualquier usuario incrementar el valor de la recompensa.
    function subirRecompensaPreg(uint idx_preg) public payable {
        require(total_preg > 0, "No existen preguntas en en el sistema.");
        require(preguntas[idx_preg].estado == estado_preg.abierta, "La pregunta no esta abierta a respuestas.");
        if (msg.value > 0){
            preguntas[idx_preg].recompensa += msg.value; 
            emit SubidaRecompensaPreg(idx_preg);
        }
    }
    
    // Retorna el estado de una pregunta: abierta, votandose, consulta o anulada.
    function estadoPreg(uint idx_preg) public view returns(string memory){
        string memory estado;
        if(preguntas[idx_preg].estado == estado_preg.abierta)  estado = "Abierta.";
        if(preguntas[idx_preg].estado == estado_preg.votando)  estado = "Votando.";
        if(preguntas[idx_preg].estado == estado_preg.consulta) estado = "Consulta.";
        if(preguntas[idx_preg].estado == estado_preg.anulada)  estado = "Anulada.";

        return estado;
    }
    
    
}


