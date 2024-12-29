const spaceID = localStorage.getItem("spaceID");
const accessToken =localStorage.getItem("access_token");

const apiURL = `https://cdn.contentful.com/spaces/${spaceID}/entries?content_type=artist&access_token=${accessToken}`;

let postsContainerName = "postsContainer";

const fetchData = async () => {
  const postContainer = document.getElementById(`${postsContainerName}`);

  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error(`ERROR: HTTP-error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!postContainer) {
      throw new Error(`ERROR: Element with id "${postsContainerName}" not found.`);
    }

    // One mapping per data category
    const stageMap = {};
    const genreMap = {};
    const dayMap = {};
    const dateMap = {};

    if (data.includes?.Entry) {
      data.includes.Entry.forEach((entry) => {
        switch (entry.sys.contentType.sys.id) {
          case 'stage':
          stageMap[entry.sys.id] = entry.fields.name || "Unknown";
          break;
          
          case 'genre':
          genreMap[entry.sys.id] = entry.fields.name || "Unknown";
          break;

          case 'day':
          dayMap[entry.sys.id] = entry.fields.description || "Unknown";
          dateMap[entry.sys.id] = entry.fields.date || "Unknown";
          break;
        }
      });
    }

    const postsHTML = data.items
      .map((post) => {
        const genreId = post.fields.genre?.sys?.id;
        const stageId = post.fields.stage?.sys?.id;
        const dayId = post.fields.day?.sys?.id;

        const artistName = post.fields.name || "Unknown Artist";
        const artistDescription = post.fields.description || "No description available";
        const genreName = genreMap[genreId] || "Unknown genre";
        const stageName = stageMap[stageId] || "Unknown stage";
        const dayName = dayMap[dayId] || "Unknown day";
        const exactDate = dateMap[dayId] || "Unknown date";

        // Removing time from date value to reduce clutter
        let simplifiedDate = exactDate.replace(/\T.*/,"");

        return `<div class="post">
                  <h2>${artistName}</h2>
                  <p>${artistDescription}</p>
                  <p>Genre: ${genreName}</p>
                  <p>Stage: ${stageName}</p>
                  <p>Date: ${simplifiedDate} (${dayName})</p>
                </div>`;
      })
      .join("");

    postContainer.innerHTML = postsHTML;
    
  } catch (error) {
    console.error("ERROR: Something went wrong! See error message:", error);

    // Display error message if something goes wrong
    if (postContainer) {
      postContainer.innerHTML = `<p class="fetchingError">Failed to fetch data. Try again later.</p>`;
    }
  }
};

// Added an event listener to run fetchData when the DOM content has fully loaded as otherwise it could display incomplete data.
document.addEventListener("DOMContentLoaded", () => {
  fetchData();
});