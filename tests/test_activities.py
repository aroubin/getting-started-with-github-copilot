from urllib.parse import quote


def test_root_redirects_to_static_index(client):
    # Arrange
    path = "/"

    # Act
    response = client.get(path, follow_redirects=False)

    # Assert
    assert response.status_code in (307, 308)
    assert response.headers["location"] == "/static/index.html"


def test_get_activities_returns_activity_dictionary(client):
    # Arrange
    path = "/activities"

    # Act
    response = client.get(path)
    payload = response.json()

    # Assert
    assert response.status_code == 200
    assert isinstance(payload, dict)
    assert "Chess Club" in payload
    assert "participants" in payload["Chess Club"]


def test_signup_adds_new_participant(client):
    # Arrange
    activity_name = "Chess Club"
    email = "new.student@mergington.edu"
    encoded_activity_name = quote(activity_name, safe="")
    path = f"/activities/{encoded_activity_name}/signup"

    # Act
    response = client.post(path, params={"email": email})
    payload = response.json()

    # Assert
    assert response.status_code == 200
    assert payload["message"] == f"Signed up {email} for {activity_name}"
    activities_response = client.get("/activities")
    assert email in activities_response.json()[activity_name]["participants"]


def test_signup_returns_404_for_unknown_activity(client):
    # Arrange
    activity_name = "Unknown Club"
    email = "student@mergington.edu"
    encoded_activity_name = quote(activity_name, safe="")
    path = f"/activities/{encoded_activity_name}/signup"

    # Act
    response = client.post(path, params={"email": email})
    payload = response.json()

    # Assert
    assert response.status_code == 404
    assert payload["detail"] == "Activity not found"


def test_signup_returns_400_for_duplicate_participant(client):
    # Arrange
    activity_name = "Chess Club"
    email = "michael@mergington.edu"
    encoded_activity_name = quote(activity_name, safe="")
    path = f"/activities/{encoded_activity_name}/signup"

    # Act
    response = client.post(path, params={"email": email})
    payload = response.json()

    # Assert
    assert response.status_code == 400
    assert payload["detail"] == "Student already signed up"


def test_unregister_removes_existing_participant(client):
    # Arrange
    activity_name = "Chess Club"
    email = "michael@mergington.edu"
    encoded_activity_name = quote(activity_name, safe="")
    path = f"/activities/{encoded_activity_name}/signup"

    # Act
    response = client.delete(path, params={"email": email})
    payload = response.json()

    # Assert
    assert response.status_code == 200
    assert payload["message"] == f"Unregistered {email} from {activity_name}"
    activities_response = client.get("/activities")
    assert email not in activities_response.json()[activity_name]["participants"]


def test_unregister_returns_404_for_unknown_activity(client):
    # Arrange
    activity_name = "Unknown Club"
    email = "student@mergington.edu"
    encoded_activity_name = quote(activity_name, safe="")
    path = f"/activities/{encoded_activity_name}/signup"

    # Act
    response = client.delete(path, params={"email": email})
    payload = response.json()

    # Assert
    assert response.status_code == 404
    assert payload["detail"] == "Activity not found"


def test_unregister_returns_404_for_non_registered_participant(client):
    # Arrange
    activity_name = "Chess Club"
    email = "not.registered@mergington.edu"
    encoded_activity_name = quote(activity_name, safe="")
    path = f"/activities/{encoded_activity_name}/signup"

    # Act
    response = client.delete(path, params={"email": email})
    payload = response.json()

    # Assert
    assert response.status_code == 404
    assert payload["detail"] == "Student not signed up for this activity"
