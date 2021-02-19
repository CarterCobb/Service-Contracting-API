# Service Contracting API

Built by Carter J. Cobb

## Details

This project uses Node.js, Express.js and MongoDB to build a lawn care business API. Requirements this project satifies are as follows:

### Business Requirements

- Users (either home owners or lawn care contractors) may self register by providing at least their name, email address, and street address. They must also indicate whether they are providing lawn care, or seeking lawn care.
- Users seeking lawn care service can request service at their home on a specific day and time,
- Service providers can retrieve a list of open service requests.
- Service providers can search a list of open service requests by City and State or by Postal code.
- Service providers can "claim" a request my marking it as accepted. Once the request is accepted by a service provider no other service providers can "claim" it.
- Service providers can mark a claimed request as completed.
- User may NOT request recurring service. They must create a new request for each lawn care service day and time.
- Users may also update their own information including: name and street address. Their email address cannot be changed.
- Users are required to create a password to use to access the service. Users may change their own password at any time.
- A user can reset their password by making a request to the service. The service will generate a new temporary password and email it to the user.

### Technical Requirements

- API must be Richardson Maturity Model level 3 (HATEOAS) compliant
- API must use HTTP Basic authentication
- API must use JSON as the primary data serialization mechanism.
- Persistent data storage can be in any relational database, graph database, or document database.
- API should handle errors by responding with an appropriate (justifiable) HTTP response code and a json body with helpful information about the error.
- API must include a administrative user with the username 'admin' and the password 'admin'

## Requirements to start

- Node.js installed
- MongoDB Atlas database with connection string

### Pre Run

- Run `npm install`
- add a `.env` file in the root directory.
- .env file keys:
  - PORT=1000
  - DOCKER_PORT=9090
  - USE_DOCKER=[set to `true` is using docker or `false` if not]
  - DATABASE_URL=[your MongoDB Connection string ( for Docker this will be mongodb://mongo:27017/your database name )]
  - EMAIL_USERNAME=[nodemailer email username]
  - EMAIL_PASS=[nodemailer email password]
  - FROM_EMAIL=[email to send from]
  - `Docker (optional)`: HOST_PATH=~/path/to/local/directory
  - `RabbitMQ (optional)`: RABBITMQ_QUEUE=lawncareapi.quere
  - `RabbitMQ (optional)`: RABBITMQ_EXCHANGE=lawncareapi.exchange
  - `RabbitMQ (optional)`: RABBITMQ_ROUTING_KEY=lawncare.routingKey
  - `RabbitMQ (optional)`: RABBITMQ_HOST=localhost:5672
  - `RabbitMQ (optional)`: RABBITMQ_USERNAME=user
  - `RabbitMQ (optional)`: RABBITMQ_PASSWORD=password

### Run

- Simply run `nodemon` in the terminal
- To get the default Admin user run the folowing in the MongoDb shell either on your local machine or the Docker container:
  - `use law-care-api`
  - `db.users.insert({name: "Admin", email: "admin", password: "$2a$10$sCZid8ACGmCmrV0pGOXNOuDwMyU8jOQfG9vefZmf69KfmYs..i9Re", address: { address_line_1: "123 Mid O' Nowhere", address_line_2: "Apt #123", zip_code: 12345, city: "Some Place", state: "UT", country: "US"}, role: "ADMIN"})`

## Additional Details

This was built as an assignment for a college class at Neumont College of Computer Science. You are free to use, modify, distrubite and share any or all parts of this project. Please refer to me (Carter J. Cobb) when sharing. Please do not use any part of this project in any way that would be considered plagiarism.
