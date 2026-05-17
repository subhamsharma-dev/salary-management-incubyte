# ruff: noqa: E501  -- name tuples are data; 10-per-row layout reads better than wrapped.
"""Vendored data for the seed script.

100 first names × 100 last names = 10,000 unique pairs — exact fit for the
10K seed target. `random.sample(range(N*M), count)` + divmod decode yields
unique `(first, last)` pairs without materialising the Cartesian product
(per `artifacts/performance.md`).
"""

FIRST_NAMES = (
    "Aarav", "Adam", "Adrian", "Aiden", "Alex", "Alice", "Amelia", "Amir", "Andrew", "Anna",
    "Anthony", "Aria", "Asher", "Aurora", "Ava", "Avery", "Ben", "Benjamin", "Bianca", "Caleb",
    "Camila", "Carlos", "Caroline", "Charlotte", "Chen", "Chloe", "Christopher", "Daniel", "David", "Diego",
    "Dmitri", "Eli", "Elena", "Elijah", "Eliza", "Ella", "Emma", "Ethan", "Eva", "Evelyn",
    "Felix", "Finn", "Fiona", "Gabriel", "Gianna", "Grace", "Hannah", "Harper", "Hassan", "Henry",
    "Hiro", "Ibrahim", "Isaac", "Isabella", "Ivy", "Jacob", "James", "Jasmine", "John", "Jordan",
    "Joseph", "Julia", "Kai", "Kavya", "Kenji", "Kira", "Kofi", "Lana", "Layla", "Leah",
    "Leo", "Lila", "Lily", "Liam", "Logan", "Lucas", "Luna", "Marcus", "Maria", "Mason",
    "Maya", "Mei", "Mia", "Michael", "Naomi", "Natalie", "Nicholas", "Noah", "Olivia", "Omar",
    "Oscar", "Owen", "Penelope", "Priya", "Quincy", "Raj", "Rohan", "Ruby", "Ryan", "Samuel",
)

LAST_NAMES = (
    "Adams", "Allen", "Anderson", "Bailey", "Baker", "Barnes", "Bell", "Bennett", "Brown", "Butler",
    "Campbell", "Carter", "Castro", "Chen", "Chowdhury", "Clark", "Coleman", "Collins", "Cook", "Cooper",
    "Cox", "Davis", "Diaz", "Dixon", "Edwards", "Evans", "Fisher", "Fitzgerald", "Flores", "Foster",
    "Garcia", "Gomez", "Gonzalez", "Gray", "Green", "Griffin", "Gupta", "Hall", "Hamilton", "Harris",
    "Hayashi", "Hayes", "Henderson", "Hernandez", "Hill", "Howard", "Hughes", "Ibrahim", "Iqbal", "Jackson",
    "James", "Jenkins", "Johnson", "Jones", "Kapoor", "Kelly", "Kennedy", "Khan", "Kim", "King",
    "Kumar", "Lee", "Lewis", "Long", "Lopez", "Martin", "Martinez", "Mehta", "Mendoza", "Miller",
    "Mitchell", "Moore", "Morgan", "Murphy", "Nakamura", "Nguyen", "Okafor", "Olsen", "Patel", "Perez",
    "Peters", "Phillips", "Powell", "Price", "Ramirez", "Reed", "Reyes", "Richardson", "Rivera", "Robinson",
    "Rodriguez", "Rogers", "Rossi", "Russell", "Sato", "Schmidt", "Scott", "Sharma", "Smith", "Yamada",
)

JOB_TITLES = (
    "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer",
    "Engineering Manager", "Director of Engineering", "VP of Engineering",
    "Product Manager", "Senior Product Manager", "Director of Product",
    "Designer", "Senior Designer", "Design Manager",
    "Sales Representative", "Senior Sales Representative", "Account Executive",
    "Sales Manager", "Director of Sales",
    "Marketing Specialist", "Marketing Manager", "Director of Marketing",
    "Financial Analyst", "Senior Financial Analyst", "Finance Manager", "Director of Finance",
    "HR Business Partner", "HR Manager",
    "Operations Analyst", "Operations Manager",
    "Customer Support Specialist", "Customer Support Manager",
)

# A representative slice of ISO-3166 alpha-2 codes for plausible spread.
COUNTRIES = ("US", "GB", "IN", "DE", "FR", "JP", "BR", "AU", "CA", "MX")
