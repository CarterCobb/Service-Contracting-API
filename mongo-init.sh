mongo -- "lawn-care-api" <<EOF
    db.users.insert({ 
      name: "Admin",
      email: "admin",
      password: "$2a$10$sCZid8ACGmCmrV0pGOXNOuDwMyU8jOQfG9vefZmf69KfmYs..i9Re",
      address: {
        address_line_1: "123 Mid O' Nowhere",
        address_line_2: "Apt #123",
        zip_code: 12345,
        city: "Some Place",
        state: "UT",
        country: "US"
      },
      role: "ADMIN"
    })
EOF