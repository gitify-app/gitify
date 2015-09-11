$(document).ready(function () {
  getLatestReleaseDetails();
});

function getLatestReleaseDetails() {
  $.getJSON("https://api.github.com/repos/ekonstantinidis/gitify/releases/latest").done(function (release) {
      var asset = release.assets[0];
      var downloadURL = "https://github.com/ekonstantinidis/gitify/releases/download/" + release.tag_name + "/" + asset.name;

      var releaseDate = new Date(release.created_at);
      var d = releaseDate.getDate();
      var m =  releaseDate.getMonth() + 1;
      var y = releaseDate.getFullYear();

      $("#download-button").attr("href", downloadURL);
      $("#latest-version .version span").text(release.tag_name);
      $("#latest-version .date span").text(d + "/" + m + "/" + y);
  });
}
