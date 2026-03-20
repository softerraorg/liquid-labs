// if (!customElements.get('media-gallery')) {
//   customElements.define(
//     'media-gallery',
//     class MediaGallery extends HTMLElement {
//       constructor() {
//         super();
//         this.elements = {
//           liveRegion: this.querySelector('[id^="GalleryStatus"]'),
//           viewer: this.querySelector('[id^="GalleryViewer"]'),
//           thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
//         };
//         this.mql = window.matchMedia('(min-width: 750px)');
//         this.initVideoAutoplay();
//         if (!this.elements.thumbnails) return;

//         this.elements.viewer.addEventListener('slideChanged', debounce(this.onSlideChanged.bind(this), 500));
//         this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
//           mediaToSwitch
//             .querySelector('button')
//             .addEventListener('click', this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false));
//         });
//         if (this.dataset.desktopLayout.includes('thumbnail') && this.mql.matches) this.removeListSemantic();
//       }

//       onSlideChanged(event) {
//         const thumbnail = this.elements.thumbnails.querySelector(
//           `[data-target="${event.detail.currentElement.dataset.mediaId}"]`
//         );
//         this.setActiveThumbnail(thumbnail);
//       }

//       setActiveMedia(mediaId, prepend) {
//         const activeMedia =
//           this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`) ||
//           this.elements.viewer.querySelector('[data-media-id]');
//         if (!activeMedia) {
//           return;
//         }
//         this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
//           element.classList.remove('is-active');
//         });
//         activeMedia?.classList?.add('is-active');

//         if (prepend) {
//           activeMedia.parentElement.firstChild !== activeMedia && activeMedia.parentElement.prepend(activeMedia);

//           if (this.elements.thumbnails) {
//             const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
//             activeThumbnail.parentElement.firstChild !== activeThumbnail && activeThumbnail.parentElement.prepend(activeThumbnail);
//           }

//           if (this.elements.viewer.slider) this.elements.viewer.resetPages();
//         }

//         this.preventStickyHeader();
//         window.setTimeout(() => {
//           if (!this.mql.matches || this.elements.thumbnails) {
//             activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft });
//           }
//           const activeMediaRect = activeMedia.getBoundingClientRect();
//           // Don't scroll if the image is already in view
//           if (activeMediaRect.top > -0.5) return;
//           const top = activeMediaRect.top + window.scrollY;
//           window.scrollTo({ top: top, behavior: 'smooth' });
//         });
//         this.playActiveMedia(activeMedia);

//         if (!this.elements.thumbnails) return;
//         const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
//         this.setActiveThumbnail(activeThumbnail);
//         this.announceLiveRegion(activeMedia, activeThumbnail.dataset.mediaPosition);
//       }

//       setActiveThumbnail(thumbnail) {
//         if (!this.elements.thumbnails || !thumbnail) return;

//         this.elements.thumbnails
//           .querySelectorAll('button')
//           .forEach((element) => element.removeAttribute('aria-current'));
//         thumbnail.querySelector('button').setAttribute('aria-current', true);
//         if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return;

//         this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft });
//       }

//       announceLiveRegion(activeItem, position) {
//         const image = activeItem.querySelector('.product__modal-opener--image img');
//         if (!image) return;
//         image.onload = () => {
//           this.elements.liveRegion.setAttribute('aria-hidden', false);
//           this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace('[index]', position);
//           setTimeout(() => {
//             this.elements.liveRegion.setAttribute('aria-hidden', true);
//           }, 2000);
//         };
//         image.src = image.src;
//       }

//       playActiveMedia(activeItem) {
//         window.pauseAllMedia();
//         const deferredMedia = activeItem.querySelector('.deferred-media');
//         if (deferredMedia) deferredMedia.loadContent(false);
//       }

//       initVideoAutoplay() {
//         const galleryViewer = this.elements.viewer;
//         if (!galleryViewer) return;

//         const deferredMediaElements = galleryViewer.querySelectorAll('deferred-media');
//         if (!deferredMediaElements.length) return;

//         const playDeferredVideo = (deferredMedia) => {
//           const template = deferredMedia.querySelector('template');
//           if (!template) return;

//           if (!deferredMedia.getAttribute('loaded')) {
//             window.pauseAllMedia();

//             const fragment = template.content.firstElementChild.cloneNode(true);

//             if (fragment.nodeName === 'VIDEO') {
//               fragment.muted = true;
//               fragment.setAttribute('muted', '');
//               fragment.setAttribute('playsinline', '');
//             }

//             deferredMedia.setAttribute('loaded', true);
//             const deferredElement = deferredMedia.appendChild(fragment);

//             if (deferredElement.nodeName === 'VIDEO') {
//               deferredElement.play().catch(() => {});
//             } else if (deferredElement.nodeName === 'IFRAME') {
//               const formerStyle = deferredElement.getAttribute('style');
//               deferredElement.setAttribute('style', 'display: block;');
//               window.setTimeout(() => deferredElement.setAttribute('style', formerStyle || ''), 0);
//             }
//           } else {
//             window.pauseAllMedia();
//             const video = deferredMedia.querySelector('video');
//             if (video) {
//               video.muted = true;
//               video.play().catch(() => {});
//             }
//           }
//         };

//         const observer = new IntersectionObserver(
//           (entries) => {
//             entries.forEach((entry) => {
//               const deferredMedia = entry.target;
//               if (entry.isIntersecting) {
//                 playDeferredVideo(deferredMedia);
//               } else {
//                 const video = deferredMedia.querySelector('video');
//                 if (video) video.pause();
//               }
//             });
//           },
//           { threshold: 0.3 }
//         );

//         deferredMediaElements.forEach((el) => observer.observe(el));

//         galleryViewer.addEventListener('slideChanged', (event) => {
//           const currentSlide = event.detail?.currentElement;
//           if (!currentSlide) return;
//           const deferredMedia = currentSlide.querySelector('deferred-media');
//           if (deferredMedia) {
//             playDeferredVideo(deferredMedia);
//           } else {
//             window.pauseAllMedia();
//           }
//         });
//       }

//       preventStickyHeader() {
//         this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
//         if (!this.stickyHeader) return;
//         this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
//       }

//       removeListSemantic() {
//         if (!this.elements.viewer.slider) return;
//         this.elements.viewer.slider.setAttribute('role', 'presentation');
//         this.elements.viewer.sliderItems.forEach((slide) => slide.setAttribute('role', 'presentation'));
//       }
//     }
//   );
// }



if (!customElements.get('media-gallery')) {
  customElements.define(
    'media-gallery',
    class MediaGallery extends HTMLElement {
      constructor() {
        super();
        this.elements = {
          liveRegion: this.querySelector('[id^="GalleryStatus"]'),
          viewer: this.querySelector('[id^="GalleryViewer"]'),
          thumbnails: this.querySelector('[id^="GalleryThumbnails"]'),
        };
        this.mql = window.matchMedia('(min-width: 750px)');
        this.initVideoAutoplay();
        if (!this.elements.thumbnails) return;

        this.elements.viewer.addEventListener('slideChanged', debounce(this.onSlideChanged.bind(this), 500));
        this.elements.thumbnails.querySelectorAll('[data-target]').forEach((mediaToSwitch) => {
          mediaToSwitch
            .querySelector('button')
            .addEventListener('click', this.setActiveMedia.bind(this, mediaToSwitch.dataset.target, false));
        });
        if (this.dataset.desktopLayout.includes('thumbnail') && this.mql.matches) this.removeListSemantic();
      }

      onSlideChanged(event) {
        const thumbnail = this.elements.thumbnails.querySelector(
          `[data-target="${event.detail.currentElement.dataset.mediaId}"]`
        );
        this.setActiveThumbnail(thumbnail);
      }

      setActiveMedia(mediaId, prepend) {
        const activeMedia =
          this.elements.viewer.querySelector(`[data-media-id="${mediaId}"]`) ||
          this.elements.viewer.querySelector('[data-media-id]');
        if (!activeMedia) {
          return;
        }
        this.elements.viewer.querySelectorAll('[data-media-id]').forEach((element) => {
          element.classList.remove('is-active');
        });
        activeMedia?.classList?.add('is-active');

        if (prepend) {
          activeMedia.parentElement.firstChild !== activeMedia && activeMedia.parentElement.prepend(activeMedia);

          if (this.elements.thumbnails) {
            const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
            activeThumbnail.parentElement.firstChild !== activeThumbnail && activeThumbnail.parentElement.prepend(activeThumbnail);
          }

          if (this.elements.viewer.slider) this.elements.viewer.resetPages();
        }

        this.preventStickyHeader();
        window.setTimeout(() => {
          if (!this.mql.matches || this.elements.thumbnails) {
            activeMedia.parentElement.scrollTo({ left: activeMedia.offsetLeft });
          }
          const activeMediaRect = activeMedia.getBoundingClientRect();
          // Don't scroll if the image is already in view
          if (activeMediaRect.top > -0.5) return;
          const top = activeMediaRect.top + window.scrollY;
          window.scrollTo({ top: top, behavior: 'smooth' });
        });
        this.playActiveMedia(activeMedia);

        if (!this.elements.thumbnails) return;
        const activeThumbnail = this.elements.thumbnails.querySelector(`[data-target="${mediaId}"]`);
        this.setActiveThumbnail(activeThumbnail);
        this.announceLiveRegion(activeMedia, activeThumbnail.dataset.mediaPosition);
      }

      setActiveThumbnail(thumbnail) {
        if (!this.elements.thumbnails || !thumbnail) return;

        this.elements.thumbnails
          .querySelectorAll('button')
          .forEach((element) => element.removeAttribute('aria-current'));
        thumbnail.querySelector('button').setAttribute('aria-current', true);
        if (this.elements.thumbnails.isSlideVisible(thumbnail, 10)) return;

        this.elements.thumbnails.slider.scrollTo({ left: thumbnail.offsetLeft });
      }

      announceLiveRegion(activeItem, position) {
        const image = activeItem.querySelector('.product__modal-opener--image img');
        if (!image) return;
        image.onload = () => {
          this.elements.liveRegion.setAttribute('aria-hidden', false);
          this.elements.liveRegion.innerHTML = window.accessibilityStrings.imageAvailable.replace('[index]', position);
          setTimeout(() => {
            this.elements.liveRegion.setAttribute('aria-hidden', true);
          }, 2000);
        };
        image.src = image.src;
      }

      playActiveMedia(activeItem) {
        window.pauseAllMedia();
        const deferredMedia = activeItem.querySelector('.deferred-media');
        if (deferredMedia) deferredMedia.loadContent(false);
      }

      initVideoAutoplay() {
        const galleryViewer = this.elements.viewer;
        if (!galleryViewer) return;

        const deferredMediaElements = galleryViewer.querySelectorAll('deferred-media');
        if (!deferredMediaElements.length) return;

        const playDeferredVideo = (deferredMedia) => {
          const template = deferredMedia.querySelector('template');
          if (!template) return;

          if (!deferredMedia.getAttribute('loaded')) {
            window.pauseAllMedia();

            const fragment = template.content.firstElementChild.cloneNode(true);

            if (fragment.nodeName === 'VIDEO') {
              fragment.muted = true;
              fragment.setAttribute('muted', '');
              fragment.setAttribute('playsinline', '');
            }

            deferredMedia.setAttribute('loaded', true);
            const deferredElement = deferredMedia.appendChild(fragment);

            if (deferredElement.nodeName === 'VIDEO') {
              deferredElement.play().catch(() => {});
            } else if (deferredElement.nodeName === 'IFRAME') {
              const formerStyle = deferredElement.getAttribute('style');
              deferredElement.setAttribute('style', 'display: block;');
              window.setTimeout(() => deferredElement.setAttribute('style', formerStyle || ''), 0);
            }
          } else {
            window.pauseAllMedia();
            const video = deferredMedia.querySelector('video');
            if (video) {
              video.muted = true;
              video.play().catch(() => {});
            }
          }
        };

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              const deferredMedia = entry.target;
              if (entry.isIntersecting) {
                playDeferredVideo(deferredMedia);
              } else {
                const video = deferredMedia.querySelector('video');
                if (video) video.pause();
              }
            });
          },
          { threshold: 0, rootMargin: '0px' }
        );

        deferredMediaElements.forEach((el) => observer.observe(el));

        // Fallback: after layout settles, play any video already in the viewport
        window.setTimeout(() => {
          deferredMediaElements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;
            if (inView && !el.getAttribute('loaded')) {
              playDeferredVideo(el);
            }
          });
        }, 800);

        galleryViewer.addEventListener('slideChanged', (event) => {
          const currentSlide = event.detail?.currentElement;
          if (!currentSlide) return;
          const deferredMedia = currentSlide.querySelector('deferred-media');
          if (deferredMedia) {
            playDeferredVideo(deferredMedia);
          } else {
            window.pauseAllMedia();
          }
        });
      }

      preventStickyHeader() {
        this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
        if (!this.stickyHeader) return;
        this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
      }

      removeListSemantic() {
        if (!this.elements.viewer.slider) return;
        this.elements.viewer.slider.setAttribute('role', 'presentation');
        this.elements.viewer.sliderItems.forEach((slide) => slide.setAttribute('role', 'presentation'));
      }
    }
  );
}

