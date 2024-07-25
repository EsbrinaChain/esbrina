// 0xd14E645CDf9f57B2ED2DB211fd60186951438D3C  contract address a Garnache
// 0x195dc1e0844d87b76fbfc0162bc1e1050c19c38d
// admin: 0x0d5d41b38C99f5CE596690Bf9Fb376076a120481
//
//othr accounts
//   0x6b7d4DE1b4e4F04C1182Bcdf7b7De0C408F321fc
//   0x4c43633313E9bDa1F008AA45F0B36649f4D89C3d


export let ABI = {

    default: [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "num",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "t",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "units",
				"type": "string"
			}
		],
		"name": "admCfgTiempoRespuesta",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			}
		],
		"name": "consultaRespuestaVotada",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_usr",
				"type": "address"
			}
		],
		"name": "consUsrPrestigio",
		"outputs": [
			{
				"internalType": "int256",
				"name": "",
				"type": "int256"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "texto",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "nombre",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "apellidos",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "alia",
				"type": "string"
			}
		],
		"name": "creaPregunta",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id_preg",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "texto",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "nombre",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "apellidos",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "alia",
				"type": "string"
			}
		],
		"name": "creaRespuesta",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			}
		],
		"name": "finalizaVotacion",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id_preg",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "autor",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "respGanadora",
				"type": "uint256"
			}
		],
		"name": "FinalVotacion",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id_preg",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address[]",
				"name": "autor_s",
				"type": "address[]"
			}
		],
		"name": "GanadorPregunta",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			}
		],
		"name": "iniciaVotacion",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id_preg",
				"type": "uint256"
			}
		],
		"name": "InicioVotacion",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id_preg",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "motivo",
				"type": "string"
			}
		],
		"name": "PreguntaAnulada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "_id_preg",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_autor",
				"type": "address"
			}
		],
		"name": "PreguntaCreada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "_id_preg",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "_autor",
				"type": "address"
			}
		],
		"name": "RespuestaCreada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id_preg",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id_resp",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "autor",
				"type": "address"
			}
		],
		"name": "RespuestaCreada",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "cupo_max",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "autor",
				"type": "address"
			}
		],
		"name": "RespuestaFueraDeCupo",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id_resp",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "autor",
				"type": "address"
			}
		],
		"name": "RespuestaFueraDeTiempo",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "id_preg",
				"type": "uint256"
			}
		],
		"name": "SubidaRecompensaPreg",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			}
		],
		"name": "subirRecompensaPreg",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "idx_resp",
				"type": "uint256"
			}
		],
		"name": "votarRespuesta",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "_admin",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_adr",
				"type": "address"
			}
		],
		"name": "adrRespondeVence",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			}
		],
		"name": "consultaPrecioRespuestaVotada",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "cupo_respuestas",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			}
		],
		"name": "estadoPreg",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "preg_resp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id_resp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "id_preg",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "votos",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "autor",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "enunciado",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "ganadora",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "pregNumResp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "preguntas",
		"outputs": [
			{
				"internalType": "enum preguntar.estado_preg",
				"name": "estado",
				"type": "uint8"
			},
			{
				"internalType": "uint256",
				"name": "recompensa",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "creada",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "fecha_votacion",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "autor",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "enunciado",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "votada",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tiempo_respuesta",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "tiempo_votacion",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "total_preg",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "total_resp",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "total_usuarios",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "usuarios",
		"outputs": [
			{
				"internalType": "string",
				"name": "nom",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "app",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "aliase",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "vetado",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "existe",
				"type": "bool"
			},
			{
				"internalType": "int256",
				"name": "prestigio",
				"type": "int256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "idx_preg",
				"type": "uint256"
			}
		],
		"name": "vencePregunta",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "votaciones",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
}