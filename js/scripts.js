var map;
let markers = [];
let autocomplete;

$("#whatsapp-contact").inputmask({"mask": "(999) 999-9999"});

function initMap() {

  //centralizando a cidade
  // neste caso, Natal-RN-Brasil
  const center = { lat: -5.812757, lng: -35.255127 };
  // Create a bounding box with sides ~50km away from the center point
  // estabelecendo um limite de busca de 50Km do centro de criação do mapa
  // isso limita a busca apenas aos endereços situados dentro da cidade
  const defaultBounds = {
  north: center.lat + 0.5,
  south: center.lat - 0.5,
  east: center.lng + 0.5,
  west: center.lng - 0.5,
};

  const input = document.getElementById("endereco");
  const options = {
    bounds: defaultBounds,
    componentRestrictions: { country: "br" },
    fields: ["address_components", "geometry", "name"], //eu removi isso entre geometry e name:  , "icon"
    origin: center,
    strictBounds: true, // limitando, de fato, as buscas dentro da região do mapa
    types: ["geocode", "establishment"],
  };

  autocomplete = new google.maps.places.Autocomplete(input, options);

  map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -5.812757, lng: -35.255127},
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoom: 12
  });

  google.maps.event.addListener(map, 'click', function(event) {
      placeMarker(event.latLng);
    });

    //chamando o evento de colocar um marcador no mapa quando o usuario seleciona um endereço da lista 
    //do autocomplete
  google.maps.event.addListener(autocomplete, 'place_changed', function(event) {
    putMarker();
  });
}


//função para colocar um marcador baseado na localização
//que vem do evento de clicar no mapa
function placeMarker(location) {
    deleteMarkers();
    var marker = new google.maps.Marker({
        position: location, 
        map: map
    });
    markers.push(marker);

    const geocoder = new google.maps.Geocoder();

    document.getElementById("latlong").innerHTML = location;
    geocodeLatLng(geocoder, map);
}

//função que seta a visibilidade das informações do buraco dentro do painel flutuante
function ativandoPainelForm(){
  //setando a div grande por trás
  document.getElementById("bg-floating-panel").style.backgroundColor = "#fff";
  document.getElementById("bg-floating-panel").style.border = "1px solid #999";
  // document.getElementById("bg-floating-panel").style.visibility = "visible";

  //setando as informações do buraco
  document.getElementById("confirmarInfo").style.display = "block";
}

//função chamada pelo botão buscar na tela principal
function putMarker(){
    const geocoder = new google.maps.Geocoder();
    geocodeAddress(geocoder, map); //chamando a função que marca no ponto partindo do endereço do input
}

//função para marcar no mapa à partir da localização inserida no input
function geocodeAddress(geocoder, resultsMap) {
    const address = document.getElementById("endereco").value;
    geocoder.geocode({ address: address }, (results, status) => {
      if (status === "OK") {
        deleteMarkers(); //deletando os marcadores existentes após inserir o novo
        resultsMap.setCenter(results[0].geometry.location);
        resultsMap.setZoom(17);
        markers.push(new google.maps.Marker({
          map: resultsMap,
          position: results[0].geometry.location,
        }));

        //inserindo na tag endereço o endereço do marcador que foi buscado pelo mapa

        var enderecoFormatado = results[0].address_components[1].short_name+", "+
                                    results[0].address_components[0].short_name+" - "+
                                    results[0].address_components[2].short_name+", "+
                                    results[0].address_components[3].short_name;

        // document.getElementById("tagEndereco").innerHTML = results[0].formatted_address;
        document.getElementById("tagEndereco").innerHTML = enderecoFormatado;
        //chamando a função que ativa o painel maior com as informações do buraco
        ativandoPainelForm();
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  }

function geocodeLatLng(geocoder, map) {
    
    const input = document.getElementById("latlong").innerHTML.slice(1,-1);
    const latlngStr = input.split(",", 2);
    const latlng = {
      lat: parseFloat(latlngStr[0]),
      lng: parseFloat(latlngStr[1]),
    };
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          map.setZoom(17);
          map.setCenter(results[0].geometry.location);
          const marker = new google.maps.Marker({
            position: latlng,
            map: map,
          });
          markers.push(marker); //adicionando o marcador na lista
          //document.getElementById("resultado").innerHTML = results[0].formatted_address;
          var enderecoFormatado = results[0].address_components[1].short_name+", "+
                                    results[0].address_components[0].short_name+" - "+
                                    results[0].address_components[2].short_name+", "+
                                    results[0].address_components[3].short_name;
          document.getElementById("tagEndereco").innerHTML = enderecoFormatado;//results[0].address_components[1].short_name;
          ativandoPainelForm();
          console.log(results[0]);
        } else {
          window.alert("No results found");
        }
      } else {
        window.alert("Geocoder failed due to: " + status);
      }
    });
}

// criando o parágrafo para colocar o endereço
function createParagraph(texto){
    var divEndereco = document.createElement("p");
    var conteudo = document.createTextNode(texto);
    divEndereco.appendChild(conteudo);

    document.getElementById("latlong").appendChild(divEndereco);

    createSubmitButton();
}

function createSubmitButton(){
    var botao = document.createElement("button");
    var conteudo = document.createTextNode("CONFIRMAR E ENVIAR");
    botao.appendChild(conteudo);

    document.getElementById("latlong").appendChild(botao);
}

//enviando as informações do formulário para o sistema
function enviarForm(){
  alert("Informações enviadas. Obrigado!");
  document.location.reload(true);
}

//função que limpa os marcadores
function deleteMarkers() {
    clearMarkers();
    markers = [];
}

//função auxiliar que limpa os marcadores
function clearMarkers() {
    setMapOnAll(null);
  }

function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
}