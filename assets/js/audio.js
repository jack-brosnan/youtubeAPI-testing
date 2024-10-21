document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '1d41b48d2bmsh15048a4308203adp154f9ejsnb167e1a83132';
    const apiHost = 'genius-song-lyrics1.p.rapidapi.com';

    // Event listener for the search button click
    document.getElementById('search-btn').addEventListener('click', function () {
        const songQuery = document.getElementById('search-input').value;
        const artistQuery = document.getElementById('artist-input').value; // Get artist input

        if (songQuery) {
            searchSong(songQuery, artistQuery); // Pass both song and artist queries
        }
    });

    // Function to search for songs
    async function searchSong(songQuery, artistQuery) {
        const url = `https://${apiHost}/search/?q=${encodeURIComponent(songQuery)}&per_page=10&page=1`;  // Use songQuery for API search
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        };

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`An error occurred: ${response.status}`);
            }

            const data = await response.json();
            console.log("Song Data:", data);

            displayResults(data, songQuery, artistQuery); // Pass both song and artist to displayResults
        } catch (error) {
            console.error("Error fetching song information:", error);
            document.getElementById('song-info').style.display = 'none'; // Hide info on error
            document.getElementById('lyrics-content').innerText = 'Error fetching song information';
        }
    }

    // Function to normalize a string for lenient matching
    function normalizeString(str) {
        return str
            .toLowerCase() // Convert to lowercase
            .replace(/[^\w\s]/gi, '') // Remove punctuation and special characters
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .trim(); // Remove leading/trailing spaces
    }

    // Function to display search results
    function displayResults(data, songQuery, artistQuery) {
        const songInfoDiv = document.getElementById('song-info');
        const lyricsDiv = document.getElementById('lyrics');

        // Hide all sections initially
        songInfoDiv.style.display = 'none';
        lyricsDiv.style.display = 'none';

        if (data.hits && data.hits.length > 0) {
            // Normalize queries to make them more lenient
            const normalizedSongQuery = normalizeString(songQuery);
            const normalizedArtistQuery = artistQuery ? normalizeString(artistQuery) : ''; // Optional

            // Filter results based on the song title and artist name if provided
            const filteredHits = data.hits.filter(hit => {
                const songTitle = normalizeString(hit.result.title_with_featured);
                const artistName = normalizeString(hit.result.primary_artist.name);

                // Check if the song matches and, if an artist is provided, it also matches the artist
                const songMatches = songTitle.includes(normalizedSongQuery);
                const artistMatches = artistQuery ? artistName.includes(normalizedArtistQuery) : true;

                return songMatches && artistMatches;
            });

            if (filteredHits.length > 0) {
                // Find the song with the highest pyongs_count from filtered results
                let topSong = filteredHits.reduce((max, current) => {
                    return current.result.pyongs_count > max.result.pyongs_count ? current : max;
                });

                const hit = topSong.result; // The song with the highest pyongs_count

                // Display song info
                const songTitle = hit.title_with_featured;
                const artist = hit.primary_artist.name;
                const releaseDate = hit.release_date_for_display;
                const albumCover = hit.song_art_image_url; // Album cover image
                const songId = hit.id; // Get the song ID for fetching lyrics

                // Update HTML with song data
                document.getElementById('song-title').innerText = songTitle;
                document.getElementById('artist-name').innerText = `Artist: ${artist}`;
                document.getElementById('release-date').innerText = `Release Date: ${releaseDate}`;
                document.getElementById('album-cover').src = albumCover;

                // Show the song info section
                songInfoDiv.style.display = 'block';

                // Fetch and display song lyrics
                fetchSongLyrics(songId);
                lyricsDiv.style.display = 'block';

            } else {
                document.getElementById('lyrics-content').innerText = 'No song results found';
            }
        } else {
            document.getElementById('lyrics-content').innerText = 'No song results found';
        }
    }

    // Function to search for song lyrics by song_id (no changes needed here)
    async function fetchSongLyrics(songId) {
        const url = `https://${apiHost}/song/lyrics/?id=${songId}`;
        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': apiHost
            }
        };

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`An error occurred: ${response.status}`);
            }

            const data = await response.json();
            console.log("Lyrics data:", data);

            if (data.lyrics) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data.lyrics.lyrics.body.html;

                const strippedLyrics = tempDiv.innerText;

                document.getElementById('lyrics-content').innerText = strippedLyrics;
            } else {
                document.getElementById('lyrics-content').innerText = 'Lyrics not available.';
            }
        } catch (error) {
            console.error("Error fetching song lyrics:", error);
            document.getElementById('lyrics-content').innerText = 'Error fetching lyrics.';
        }
    }

    // Toggle lyrics visibility
    document.getElementById("toggle-lyrics").addEventListener("click", function () {
        const lyricsContainer = document.getElementById('lyrics-content');
        lyricsContainer.classList.toggle("d-none");
    });

    // Toggle lyrics visibility
    document.getElementById("toggle-artist-query").addEventListener("click", function () {
        const artistSearchToggle = document.getElementById("toggle-artist-query");
        const artistSearchInput = document.getElementById('artist-input');
        artistSearchToggle.classList.toggle("d-none");
        artistSearchInput.classList.toggle("d-none");
    });
});
