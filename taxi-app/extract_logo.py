import re
import base64

with open('c:/Users/hp/Desktop/rafik 3/taxi-app/rafiq-onboarding-flow.html', 'r', encoding='utf-8') as f:
    html = f.read()

matches = re.findall(r'src="data:image/(png|jpeg);base64,([^"]+)"', html)
if matches:
    with open('c:/Users/hp/Desktop/rafik 3/taxi-app/public/logo.png', 'wb') as out:
        out.write(base64.b64decode(matches[0][1]))
    print("Logo extracted and saved to logo.png")
else:
    print("No images found in the file.")
