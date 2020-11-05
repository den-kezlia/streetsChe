const parseImages = () => {
    const images = IMAGES;

    images.forEach(image => {
        console.log(image.GPS);
    });
}

const initMap = () => {
    mapboxgl.accessToken = 'pk.eyJ1IjoiZGVua2V6bGlhIiwiYSI6ImNrZndmNHVrdDFrdzIycXBkYTN0b3IybzEifQ.jdA9gXZL-JLS6c8yS4ecng';
    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        center: [31.26562, 51.49322], // starting position [lng, lat]
        zoom: 12 // starting zoom
    });

    IMAGES.forEach(image => {
        if (image.GPS) {
            const imageHtml = `<img src="${image.url}" width="300" height="225" class="popup-image" />`;
            const popup = new mapboxgl.Popup();
            const marker = new mapboxgl.Marker();

            popup.setHTML(imageHtml).setMaxWidth("320px");

            marker.setLngLat([image.GPS.lng, image.GPS.lat])
                .setPopup(popup)
                .addTo(map);
        }
    });
}

parseImages();
initMap();