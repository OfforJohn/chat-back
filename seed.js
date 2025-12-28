import getPrismaInstance from "./PrismaClient.js"; // adjust path if needed

async function main() {
  const prisma = getPrismaInstance();

  // Seed users
  await prisma.user.createMany({
    data: [
      {
        name: "Alice",
        email: "alice@test.com",
        firebaseUid: "uid_alice",
        profilePicture: "https://example.com/alice.jpg",
        phoneNumber: "1234567890",
        about: "Hello, I am Alice",
      },
      {
        name: "Bob",
        email: "bob@test.com",
        firebaseUid: "uid_bob",
        profilePicture: "https://example.com/bob.jpg",
        phoneNumber: "2345678901",
        about: "Hello, I am Bob",
      },
      {
        name: "Charlie",
        email: "charlie@test.com",
        firebaseUid: "uid_charlie",
        profilePicture: "https://example.com/charlie.jpg",
        phoneNumber: "3456789012",
        about: "Hello, I am Charlie",
      },
    ],
    skipDuplicates: true, // avoids errors if running multiple times
  });

  console.log("Users seeded!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    process.exit();
  });
