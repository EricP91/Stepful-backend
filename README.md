# README.md

## Overview

This is a Node.js application built using the Express.js framework. It provides a RESTful API for managing user authentication, slots, and reviews.

## API Endpoints

### Authentication

- `POST /auth/login`: Login a user with a username and password.
- `POST /auth/logout`: Logout a user.

### Slots

- `POST /slots`: Schedule a session by a coach.
- `GET /slots/:user_name`: Get slots by a coach.
- `GET /slot`: Get a slot by coach and time.

### Reviews

- (Not implemented yet)

## Database

The application uses a PostgreSQL database to store user, slot, and review data. The database connection is established using the `pg` module.

## Authentication and Authorization

The application uses JSON Web Tokens (JWT) to authenticate and authorize users. The `authenticateToken` middleware is used to verify the token on each request.

## Code Structure

The code is organized into the following directories:

- `controllers`: Contains the business logic of the application, including user authentication, slot management, and review management.
- `middlewares`: Contains the middleware functions, including authentication and authorization.
- `routes`: Contains the API endpoints, including authentication, slots, and reviews.
- `config`: Contains the database connection configuration.
- `server`: Contains the Express.js server setup.

## Environment Variables

The application uses the following environment variables:

- `DATABASE_URL`: The URL of the PostgreSQL database.
- `JWT_SECRET`: The secret key for signing and verifying JWT tokens.

## Running the Application

To run the application, execute the following command:

```
npm start
```

This will start the Express.js server and make the API endpoints available.

## Testing

To test the application, execute the following command:

```
npm test
```

This will run the tests for the application.

## Contributing

Contributions are welcome! Please submit a pull request with your changes.

## License

This application is licensed under the ISC License.

## System Design

![Design](./stepful-system-design.png)