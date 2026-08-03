// Flight Crew Files — click-to-play "Watch Documentary" embeds
// (secret-skies.html and the individual aircraft case files). Same
// thumbnail-facade pattern as videos.js: some YouTube videos restrict
// embedding, which shows a broken placeholder inside an always-on iframe.
// Showing the real thumbnail and only creating the iframe on click sidesteps
// that and avoids loading a YouTube player before the reader asks for it.
(function () {
  function activateEmbed(facade) {
    var videoId = facade.getAttribute('data-video-id');
    var title = facade.getAttribute('data-video-title') || 'Documentary';
    var iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0';
    iframe.title = title;
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.allowFullscreen = true;
    facade.replaceWith(iframe);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.watch-doc-facade').forEach(function (facade) {
      var play = function () { activateEmbed(facade); };
      facade.addEventListener('click', play);
      facade.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
      });
    });
  });
})();
