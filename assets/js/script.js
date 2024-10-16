// Youtube API

const API_KEY = 'AIzaSyAjIdytOzpiipkuBZEYhRrZMnprjmChkGQ';
const API_URL = 'https://www.googleapis.com/youtube/v3/search';

//Add event listener to search button. Triggers searchVideo()
document.getElementById('searchButton').addEventListener('click', searchVideos);

//Add event listener to [enter] key press when search input is in focus. Triggers searchVideo()
document.getElementById('searchInput').addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        searchVideos();
    }
});

//Add event listener to clear button. Triggers searchVideo() that automatically clears filter
document.getElementById('clearFilter').addEventListener('click', searchVideos);

let selectedFilter = ''; // Holds the filter type based on the selected radio button

// Add event listeners to radio buttons to trigger search when clicked
document.querySelectorAll('input[name="inlineRadioOptions"]').forEach((radio) => {
    radio.addEventListener('change', function () {
        // Get the data-type value from the selected radio button
        selectedFilter = this.getAttribute('data-type');
        searchVideos(false); // Refresh search results, but don't clear the filter
    });
});

// Function to clear all radio button selections
function clearRadioButtons() {
    document.querySelectorAll('input[name="inlineRadioOptions"]').forEach((radio) => {
        radio.checked = false; // Uncheck each radio button
    });
}


// Asynchronous Function to search YouTube for videos based on user input
async function searchVideos(clearFilter = false) {
    const query = document.getElementById('searchInput').value;

  // Clear the filter and reset radio buttons only if it's a new search query
  if (clearFilter) {
    clearRadioButtons();   // Clear radio buttons on new search
    selectedFilter = '';   // Reset selected filter when starting a new search
}

    const fullQuery = selectedFilter ? `${query} ${selectedFilter}` : query; //checks if filter option is selected
    const API_STRING =
        // encodeURIComponent used here to replace spaces in user query with corresponding URL safe character
        `${API_URL}?part=snippet&maxResults=5&q=${encodeURIComponent(fullQuery)}&type=video&key=${API_KEY}`;

    const response = await fetch(API_STRING);
    //Convert API data to a usuable format - JSON
    const data = await response.json();
    displayVideos(data.items);
}

// Function to display video search results
function displayVideos(e) {
    const videoList = document.getElementById('videoList');
    videoList.innerHTML = ''; // Clear previous query results

    //Loop through new results and create div element including html
    e.forEach(video => {
        const videoId = video.id.videoId;
        const videoCard = document.createElement('div');
        videoCard.classList.add('col-12', 'mb-3', 'd-flex', 'justify-content-center');
        videoCard.innerHTML = `
                    <div class = "card mb-1" style="max-width: 80%; width: 80%;">
                        <div class="row g-0">
                            <div class="col-md-4">
                                <img src="${video.snippet.thumbnails.medium.url}" class="img-fluid rounded-start" alt="${video.snippet.title}" height="100%" width="100%">
                            </div>
                            <div class="col-md-7">
                                <div class="card-body">
                                    <h6 class="card-title">${video.snippet.title}</h6>
                                    <p class="card-text">${video.snippet.description.substring(0, 200)}...</p>                                    
                                </div>
                            </div>
                            <div class="col-md-1 d-flex justify-content-center align-items-center playbutton-bg">
                                <a href="javascript:void(0)" onclick="openModal('${videoId}')"><i class="fa-solid fa-play fa-beat" style="color: #74C0FC;"></i></a>
                            </div>
                        </div>
                    </div>
                `;
        videoList.appendChild(videoCard); //adds above div element within 'videoList' div
    });
}


// Function to open the Bootstrap modal and play the selected video
function openModal(videoId) {
    const videoIframe = document.getElementById('videoIframe');

    // Set the iframe source to the YouTube URL
    videoIframe.src = `https://www.youtube.com/embed/${videoId}`;

    // Open the modal
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    modal.show();
}

// Clear iframe src when modal is closed to stop video playback
document.getElementById('videoModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('videoIframe').src = '';
});