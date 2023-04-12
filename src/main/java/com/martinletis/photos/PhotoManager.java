package com.martinletis.photos;

import com.google.api.client.auth.oauth2.AuthorizationCodeFlow;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.extensions.java6.auth.oauth2.AuthorizationCodeInstalledApp;
import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.gax.core.FixedCredentialsProvider;
import com.google.auth.Credentials;
import com.google.auth.oauth2.UserCredentials;
import com.google.common.base.Joiner;
import com.google.photos.library.v1.PhotosLibraryClient;
import com.google.photos.library.v1.PhotosLibrarySettings;
import com.google.photos.library.v1.internal.InternalPhotosLibraryClient.ListAlbumsPagedResponse;
import com.google.photos.library.v1.internal.InternalPhotosLibraryClient.SearchMediaItemsPagedResponse;
import com.google.photos.library.v1.proto.ListAlbumsRequest;
import com.google.photos.library.v1.proto.SearchMediaItemsRequest;
import com.google.photos.types.proto.Album;
import com.google.photos.types.proto.MediaItem;
import java.io.File;
import java.io.FileReader;
import java.io.Reader;
import java.util.Collections;

public class PhotoManager {

  private static final String APP_NAME = "martinletis-photos-0.1";

  public static void main(String[] args) throws Exception {
    NetHttpTransport transport = GoogleNetHttpTransport.newTrustedTransport();
    JsonFactory jsonFactory = GsonFactory.getDefaultInstance();

    GoogleClientSecrets secrets;
    try (Reader reader = new FileReader(args[0])) {
      secrets = GoogleClientSecrets.load(jsonFactory, reader);
    }

    File dataDirectory =
        new File(
            Joiner.on(File.separator)
                .join(System.getProperty("user.home"), "tmp", APP_NAME, "datastore"));

    AuthorizationCodeFlow flow =
        new GoogleAuthorizationCodeFlow.Builder(
                transport,
                jsonFactory,
                secrets,
                Collections.singleton("https://www.googleapis.com/auth/photoslibrary.readonly"))
            .setDataStoreFactory(new FileDataStoreFactory(dataDirectory))
            .build();

    Credential credential =
        new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver()).authorize("user");

    Credentials credentials =
        UserCredentials.newBuilder()
            .setClientId(secrets.getDetails().getClientId())
            .setClientSecret(secrets.getDetails().getClientSecret())
            .setRefreshToken(credential.getRefreshToken())
            .build();

    PhotosLibrarySettings settings =
        PhotosLibrarySettings.newBuilder()
            .setCredentialsProvider(FixedCredentialsProvider.create(credentials))
            .build();

    try (PhotosLibraryClient client = PhotosLibraryClient.initialize(settings)) {
      if (args.length == 1) {
        ListAlbumsPagedResponse response =
            client.listAlbums(ListAlbumsRequest.newBuilder().setPageSize(50).build());
        for (Album album : response.iterateAll()) {
          System.out.println(album);
        }
      } else {
        SearchMediaItemsPagedResponse searchMediaItems =
            client.searchMediaItems(
                SearchMediaItemsRequest.newBuilder().setAlbumId(args[0]).setPageSize(100).build());
        for (MediaItem mediaItem : searchMediaItems.iterateAll()) {
          System.out.println(mediaItem.getFilename());
        }
      }
    }
  }
}
