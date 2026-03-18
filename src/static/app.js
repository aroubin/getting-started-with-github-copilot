document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Title
        const titleEl = document.createElement("h4");
        titleEl.textContent = name;
        activityCard.appendChild(titleEl);

        // Description
        const descriptionEl = document.createElement("p");
        descriptionEl.textContent = details.description;
        activityCard.appendChild(descriptionEl);

        // Schedule
        const scheduleEl = document.createElement("p");
        const scheduleStrong = document.createElement("strong");
        scheduleStrong.textContent = "Schedule:";
        scheduleEl.appendChild(scheduleStrong);
        scheduleEl.appendChild(document.createTextNode(" " + details.schedule));
        activityCard.appendChild(scheduleEl);

        // Availability
        const availabilityEl = document.createElement("p");
        const availabilityStrong = document.createElement("strong");
        availabilityStrong.textContent = "Availability:";
        availabilityEl.appendChild(availabilityStrong);
        availabilityEl.appendChild(
          document.createTextNode(" " + spotsLeft + " spots left")
        );
        activityCard.appendChild(availabilityEl);

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsHeading = document.createElement("p");
        participantsHeading.className = "participants-heading";
        const participantsHeadingStrong = document.createElement("strong");
        participantsHeadingStrong.textContent = "Participants:";
        participantsHeading.appendChild(participantsHeadingStrong);
        participantsSection.appendChild(participantsHeading);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (details.participants.length === 0) {
          const emptyItem = document.createElement("li");
          emptyItem.className = "participants-empty";
          emptyItem.textContent = "No students registered yet";
          participantsList.appendChild(emptyItem);
        } else {
          details.participants.forEach((participant) => {
            const participantItem = document.createElement("li");
            participantItem.className = "participant-item";

            const participantEmailSpan = document.createElement("span");
            participantEmailSpan.className = "participant-email";
            participantEmailSpan.textContent = participant;
            participantItem.appendChild(participantEmailSpan);

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "participant-delete-btn";
            deleteButton.setAttribute("data-activity", name);
            deleteButton.setAttribute("data-email", participant);
            deleteButton.setAttribute(
              "aria-label",
              "Remove " + participant + " from " + name
            );
            deleteButton.title = "Unregister participant";
            deleteButton.textContent = "×";

            participantItem.appendChild(deleteButton);
            participantsList.appendChild(participantItem);
          });
        }

        participantsSection.appendChild(participantsList);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  activitiesList.addEventListener("click", async (event) => {
    const deleteButton = event.target.closest(".participant-delete-btn");
    if (!deleteButton) {
      return;
    }

    const activity = deleteButton.dataset.activity;
    const email = deleteButton.dataset.email;

    if (!activity || !email) {
      return;
    }

    deleteButton.disabled = true;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "Unable to unregister participant.";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister participant. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering participant:", error);
    } finally {
      deleteButton.disabled = false;
    }
  });

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
