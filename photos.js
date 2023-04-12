/*
let tokenClient;

function aa() {
  gapi.client.request({
    'path': 'https://photoslibrary.googleapis.com/v1/albums?pageSize=50',
  }).then(response => alert(response.result));
}



function initClient() {
  gapi.client.init({}).then(() => listAlbums());
}

function loadClient() {
  gapi.load('client', initClient);
}
*/
var client;
var access_token;

function initClient() {
  client = google.accounts.oauth2.initTokenClient({
    client_id: '575230163-oagks79i1pa00ndbtrab8koio7rmtfqt.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
    callback: (tokenResponse) => {
      access_token = tokenResponse.access_token;
    },
  });
}  

function getToken() {
  client.requestAccessToken();
}

function listAlbums(nextPageToken) {
  const url = new URL('https://photoslibrary.googleapis.com/v1/albums');
  url.searchParams.append('pageSize', 50);
  if (nextPageToken) {
    url.searchParams.append('pageToken', nextPageToken);
  }

  fetch(url, {headers: {Authorization: 'Bearer ' + access_token}})
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.nextPageToken) {
        listAlbums(data.nextPageToken);
      }
    });
}
