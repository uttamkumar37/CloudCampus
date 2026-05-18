package com.cloudcampus.demo;

import java.util.Random;

/**
 * Generates realistic Indian names, phone numbers, and email addresses
 * for demo-data seeding. Not cryptographically random — uses a seeded
 * {@link Random} for deterministic repeatable output across resets.
 */
public final class IndianNameGenerator {

    private static final String[] MALE_FIRST = {
        "Aarav","Advait","Akash","Amit","Anand","Ankit","Arjun","Arnav","Arun","Ayaan",
        "Bhavesh","Chirag","Deepak","Dev","Dhruv","Gaurav","Hardik","Ishaan","Jai","Karan",
        "Krishna","Kunal","Lokesh","Manish","Milan","Mohit","Nakul","Neeraj","Nikhil","Nitin",
        "Pankaj","Parth","Pranav","Prateek","Rahul","Raj","Rajesh","Ram","Ritesh","Rohit",
        "Rohan","Sachin","Sahil","Sanjay","Shivam","Siddharth","Sumit","Suresh","Tarun","Vivek"
    };

    private static final String[] FEMALE_FIRST = {
        "Aisha","Ananya","Anjali","Ankita","Anushka","Arpita","Deepa","Diya","Divya","Gauri",
        "Isha","Jyoti","Kavya","Khushi","Komal","Lakshmi","Mansi","Meera","Megha","Nandini",
        "Neha","Nisha","Pallavi","Pooja","Prachi","Priya","Rani","Rashmi","Riya","Ruchi",
        "Sakshi","Sandhya","Shreya","Simran","Sneha","Sonam","Swati","Tanvi","Tara","Usha",
        "Vanessa","Varsha","Vidya","Vimla","Yamini","Yogita","Zara","Seema","Shweta","Puja"
    };

    private static final String[] LAST = {
        "Agarwal","Ahuja","Bhatia","Chandra","Chopra","Das","Desai","Dubey","Fernandez","Gandhi",
        "Ghosh","Gupta","Iyer","Jain","Joshi","Kapoor","Kaur","Khan","Khanna","Kumar",
        "Malhotra","Mehta","Mishra","Nair","Pandey","Patel","Pillai","Rao","Reddy","Sahni",
        "Sharma","Shukla","Singh","Sinha","Srivastava","Subramanian","Tiwari","Tripathi","Varma","Yadav",
        "Bajaj","Bhatt","Chauhan","Deshpande","Kulkarni","Mathur","Naik","Saxena","Seth","Verma"
    };

    private static final String[] CITIES = {
        "Hyderabad","Secunderabad","Cyberabad","Madhapur","Gachibowli",
        "Miyapur","Kondapur","Uppal","LB Nagar","Kukatpally"
    };

    private final Random rng;

    public IndianNameGenerator(long seed) {
        this.rng = new Random(seed);
    }

    // ── Name generators ───────────────────────────────────────────────────────

    /** Returns [firstName, lastName] for a male student/staff. */
    public String[] maleName() {
        return new String[]{
            MALE_FIRST[rng.nextInt(MALE_FIRST.length)],
            LAST[rng.nextInt(LAST.length)]
        };
    }

    /** Returns [firstName, lastName] for a female student/staff. */
    public String[] femaleName() {
        return new String[]{
            FEMALE_FIRST[rng.nextInt(FEMALE_FIRST.length)],
            LAST[rng.nextInt(LAST.length)]
        };
    }

    /**
     * Returns [firstName, lastName] with randomised gender distribution.
     * ~50 % male / 50 % female.
     */
    public String[] anyName() {
        return rng.nextBoolean() ? maleName() : femaleName();
    }

    /** Returns "MALE" or "FEMALE" matching the last anyName() choice. */
    public String gender() {
        return rng.nextBoolean() ? "MALE" : "FEMALE";
    }

    // ── Contact generators ────────────────────────────────────────────────────

    /** 10-digit Indian mobile number (starts with 6-9). */
    public String phone() {
        int prefix = 6 + rng.nextInt(4);           // 6, 7, 8 or 9
        long suffix = (long)(rng.nextDouble() * 1_000_000_000L);
        return String.format("%d%09d", prefix, suffix);
    }

    /** Email derived from name parts — safe for demo use. */
    public String email(String firstName, String lastName) {
        return (firstName.toLowerCase() + "." + lastName.toLowerCase())
               .replaceAll("[^a-z.]", "") + rng.nextInt(999)
               + "@jnv-lucknow.edu.in";
    }

    /** Employee email for staff. */
    public String staffEmail(String firstName, String lastName) {
        return (firstName.toLowerCase() + "." + lastName.toLowerCase())
               .replaceAll("[^a-z.]", "")
               + "@staff.jnv-lucknow.edu.in";
    }

    /** Indian city from Hyderabad area (the school's location). */
    public String city() {
        return CITIES[rng.nextInt(CITIES.length)];
    }

    /** Full address string. */
    public String address() {
        int houseNo = 1 + rng.nextInt(999);
        return houseNo + ", " + city() + ", Telangana";
    }
}
