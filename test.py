import requests
import json
import os

def test_api(api_url, method, headers=None, payloads=None, save_responses=False, output_dir="responses"):
    if not payloads:
        payloads = [{}]
    if save_responses and not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for i, payload in enumerate(payloads, 1):
        try:
            print(f"Testing payload {i}/{len(payloads)}: {json.dumps(payload, indent=2)}")
            if method.upper() == "GET":
                response = requests.get(api_url, headers=headers, params=payload)
            elif method.upper() == "POST":
                response = requests.post(api_url, headers=headers, json=payload)
            elif method.upper() == "PUT":
                response = requests.put(api_url, headers=headers, json=payload)
            elif method.upper() == "DELETE":
                response = requests.delete(api_url, headers=headers, json=payload)
            else:
                print(f"Unsupported HTTP method: {method}")
                continue

            print(f"Response Status Code: {response.status_code}")
            print(f"Response Body: {response.text}")

            if save_responses:
                file_path = os.path.join(output_dir, f"response_{i}.json")
                with open(file_path, "w") as f:
                    json.dump({
                        "status_code": response.status_code,
                        "headers": dict(response.headers),
                        "body": response.json() if response.headers.get('Content-Type') == 'application/json' else response.text
                    }, f, indent=2)
                print(f"Response saved to {file_path}")

        except Exception as e:
            print(f"Error while testing payload {i}: {e}")

if __name__ == "__main__":
    API_URL = "http://localhost:5000/createcampaigns"
    METHOD = "POST"
    HEADERS = {
        'Authorization': 'eyJ2ZXIiOiI1IiwidWlkIjoiZWFjM2IyNzNhNTFmNGMyOWI2MjRiN2Q0OTlmNDdkMDkiLCJmc19wYWEiOjE3MzI5NDY1NTQuNTU0NzY3LCJleHAiOjB9.Z0qqeg.2bIFvCw4X2TjP9SP8z4xF3wuUL8'
    }
    PAYLOADS = [
        {
            'name': "New Campaign",
            'description': "This is a test campaign.",
            'niche': "Marketing",
            'budget': 5000,
            'start_date': "2024-12-01",
            'end_date': "2024-12-31",
            'visibility': "Public",
            'goals': "Increase brand awareness"
        }
    ]
    SAVE_RESPONSES = False

    test_api(API_URL, METHOD, HEADERS, PAYLOADS, SAVE_RESPONSES)
