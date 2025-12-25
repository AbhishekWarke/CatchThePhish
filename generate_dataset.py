# generate_dataset.py  (IMPROVED VERSION)
import os, csv, random, string

random.seed(42)

def random_string(n=6):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=n))

# ----------------------------------------------------
# SAFE DOMAINS LIST
# ----------------------------------------------------
safe_domains = [
    "google.com","youtube.com","facebook.com","wikipedia.org","twitter.com","instagram.com",
    "linkedin.com","apple.com","microsoft.com","amazon.com","netflix.com","spotify.com",
    "github.com","gitlab.com","stackoverflow.com","python.org","reddit.com","mozilla.org",
    "openai.com","dropbox.com","salesforce.com","zoom.us","slack.com","asana.com","notion.so",
    "trello.com","figma.com","canva.com","adobe.com","wordpress.com","medium.com","nytimes.com",
    "bbc.co.uk","cnn.com","theguardian.com","airbnb.com","booking.com","tripadvisor.com",
    "uber.com","lyft.com","grab.com","paypal.com","stripe.com","squareup.com","wise.com",
    "revolut.com","coinbase.com","binance.com","gov.uk","irs.gov","nic.in","coursera.org",
    "udemy.com","edx.org","khanacademy.org","w3schools.com","geeksforgeeks.org"
]

# ----------------------------------------------------
# BUILD SAFE VARIANTS
# ----------------------------------------------------
safe_variants = []
for d in safe_domains:
    safe_variants.append(d)
    parts = d.split('.')
    if len(parts) >= 2:
        safe_variants.append("www." + d)
        safe_variants.append("mail." + parts[0] + "." + parts[-1])
        safe_variants.append(parts[0] + "." + random.choice(["com","org","net"]))
for i in range(200):
    safe_variants.append(random_string(8) + ".com")

# ----------------------------------------------------
# PHISHING TEMPLATES (ORIGINAL + MINOR ADDITIONS)
# ----------------------------------------------------
phish_templates = [
    "{brand}-secure-login-{rnd}.com",
    "{brand}.account.verify-{rnd}.net",
    "secure-{brand}-login-{rnd}.info",
    "update-{brand}-billing-{rnd}.com",
    "{brand}-support-{rnd}.online",
    "{brand}verify.{rnd}.site",
    "login-{brand}-{rnd}.biz",
    "{rnd}-{brand}.security-check.org",
    "accounts.{rnd}{brand}.com",
    "{brand}-auth.{rnd}.page",
    # New ones:
    "{brand}-payment-{rnd}.shop",
    "verify-{brand}-{rnd}.top"
]

brands = [
    "google","paypal","amazon","apple","facebook","instagram","microsoft","netflix",
    "bankofamerica","chase","wellsfargo","citibank","sbi","hdfc","icicibank","paytm",
    "phonepe","airbnb","uber","linkedin"
]

# ----------------------------------------------------
# GENERATE PUNYCODE + UNICODE PHISHING
# ----------------------------------------------------
unicode_phishing = []
unicode_samples = [
    "аррӏе.com",   # looks like apple.com
    "раураӏ.com",  # paypal
    "ɡооɡӏе.com",  # google
    "instаgrаm-login.com"
]

for u in unicode_samples:
    unicode_phishing.append("http://" + u)

# ----------------------------------------------------
# GENERATE SHORTENED PHISHING URLS
# ----------------------------------------------------
shorteners = ["bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly"]

shortened_phish = []
for i in range(120):
    base = random.choice(shorteners)
    code = random_string(7)
    shortened_phish.append(f"https://{base}/{code}")

# ----------------------------------------------------
# CREATE PHISHING LIST (1000 BASE + addons)
# ----------------------------------------------------
phishing = []
for i in range(1000):
    brand = random.choice(brands)
    rnd = random_string(5)
    tpl = random.choice(phish_templates)
    url = tpl.format(brand=brand, rnd=rnd)

    if random.random() < 0.3:
        url = "http://" + url
    if random.random() < 0.25:
        url = url + "/login.php?session=" + random_string(8)
    if random.random() < 0.12:
        url = random_string(6) + "@" + url
    if random.random() < 0.1:
        ip = "{}.{}.{}.{}".format(random.randint(1,255), random.randint(0,255),
                                  random.randint(0,255), random.randint(1,254))
        url = "http://" + ip + "/" + url

    phishing.append(url)

# Add punycode + short-links
phishing += unicode_phishing
phishing += shortened_phish

# ----------------------------------------------------
# CREATE SAFE LIST (1000 BASE + long safe URLs)
# ----------------------------------------------------
safe = []
for i in range(1000):
    base = random.choice(safe_variants)

    if random.random() < 0.25:
        base = "https://" + base

    if random.random() < 0.5:
        base = base + "/" + random.choice(["", "home", "about", "contact", "products", "docs", "blog"])

    if random.random() < 0.15:
        base = base + "?q=" + random_string(6)

    safe.append(base)

# Add long safe URLs (VERY important)
long_safe = []
for i in range(200):
    d = random.choice(safe_domains)
    long_safe.append(f"https://{d}/products/{random_string(5)}/{random_string(5)}?ref={random_string(4)}&page={random.randint(1,5)}")

safe += long_safe

# ----------------------------------------------------
# COMBINE + WRITE CSV
# ----------------------------------------------------
rows = []
for u in safe:
    rows.append((u, 0))
for u in phishing:
    rows.append((u, 1))

random.shuffle(rows)

os.makedirs("data", exist_ok=True)
out_path = os.path.join("data", "data.csv")

with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["url","label"])
    for u,l in rows:
        writer.writerow([u,l])

print(f"Generated {len(rows)} rows and saved to {out_path}")
