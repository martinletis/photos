// https://developers.google.com/photos/library/reference/rest/v1/mediaItems/search
function searchMediaItems(token, id, nextPageToken) {
  const url = new URL('https://photoslibrary.googleapis.com/v1/mediaItems:search');
  url.searchParams.append('albumId', id);
  url.searchParams.append('pageSize', 100);
  if (nextPageToken) {
    url.searchParams.append('pageToken', nextPageToken);
  }
  fetch(url, {method: 'POST', headers: {Authorization: 'Bearer ' + token}})  
    .then(response => response.json())
    .then(data => {
      data.mediaItems.forEach(mediaItem => {
        console.log(mediaItem.filename);
      });
      if (data.nextPageToken) {
        searchMediaItems(token, id, data.nextPageToken);
      }
    });  
}

// https://developers.google.com/photos/library/reference/rest/v1/albums/list
function listAlbums(token, nextPageToken) {
  const url = new URL('https://photoslibrary.googleapis.com/v1/albums');
  url.searchParams.append('pageSize', 50);
  if (nextPageToken) {
    url.searchParams.append('pageToken', nextPageToken);
  }

  fetch(url, {headers: {Authorization: 'Bearer ' + token}})
    .then(response => response.json())
    .then(data => {
      const table = document.getElementById('photos');
      data.albums.forEach(album => {
        const title = document.createElement('a');
        title.appendChild(document.createTextNode(album.title));
        title.href = album.productUrl;
        title.target = '_blank';

        const id = document.createElement('a');
        id.appendChild(document.createTextNode("details"));
        id.href = '#';
        id.onclick = function(){
          searchMediaItems(token, album.id)
        };
        
        const img = document.createElement('img');
        img.alt = album.coverPhotoMediaItemId;
        img.src = album.coverPhotoBaseUrl + '=w128-h128';

        const cover = document.createElement('a');
        cover.appendChild(img);
        cover.href = album.coverPhotoBaseUrl;
        cover.target = '_blank';
        
        const row = table.insertRow();
        
        const cell = row.insertCell();
        cell.appendChild(title);
        cell.appendChild(document.createTextNode(" ("));
        cell.appendChild(id);
        cell.appendChild(document.createTextNode(")"));
        
        row.insertCell().innerHTML = album.mediaItemsCount;
        row.insertCell().appendChild(cover);
      });
      if (data.nextPageToken) {
        listAlbums(token, data.nextPageToken);
      }
    });
}

function initAuth() {
  client = google.accounts.oauth2.initTokenClient({
    client_id: '575230163-oagks79i1pa00ndbtrab8koio7rmtfqt.apps.googleusercontent.com',
    scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
    callback: tokenResponse => {
      const url = new URL(window.location.href);
      if (url.searchParams.has('id')) {
        listAlbum(tokenResponse.access_token, url.searchParams.get('id'));
      } else {
        listAlbums(tokenResponse.access_token);
      }
    },
    prompt: '',
    enable_granular_consent: false,
  });
  
  client.requestAccessToken();
}  
