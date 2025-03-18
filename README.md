# Tandem technical test

## Getting Started

The aim of this project is to quickly reveal the relevant data present in the supplied file.
Of course, there's still a lot of work to be done on the front-end and back-end, as well as on the project infrastructure and automation.
Here are some of these improvements below:

## Basics

1. Apply code standards, in particular via the prettier, eslint and husky libraries, to ensure codebase consistency.
2. Structure the code to separate the front-end from the back-end, in particular by creating a dedicated back-end (in NestJS, for example).
3. Extract data ingestion into a separate service or directly into the dedicated API as a first step.
4. Save data in a NoSQL database (such as Firestore/Mongo) instead of JSON files
5. Better structure the codebase by separating files by use (services/utils/etc).
6. Add a test stack for all project services: unit tests, integration tests and E2E tests

## Front-end

1. Create a component library so that the code for each component can be reused in future pages.
2. Create an atomic tree of components to ensure that changes are reflected throughout the component tree.
3. Use an optimized build to accelerate page loading
4. Create a UI worthy of the name and not something automatically generated :clown:

## Back-end

1. Create dedicated back-end to contain all API routes and better separate concerns
2. Add a logging system to quickly find information about the system in the event of a malfunction.
3. Better define models and, above all, DTOs to ensure consistency between front-end and back-end and reduce the risk of errors during version upgrades.
4. Add basic functionalities such as authentication, route security and protection against basic attacks (brute force attacks, dictionary attacks, etc.).
5. Integrate event ingestion and processing functions, and store results to avoid multiple processing.
6. Add a Sentry-type monitoring system to automatically receive alerts by e-mail/Slack and other means.

## To go further

1. Create an event-driven service to ingest data$
2. Create an event-processing engine to manage main and common cases
3. Add an AI model for complex cases or cases not simply recognized by the data processing engine
4. When data volume is very high, temporize data using caching or a message broker (such as Redis, Kafka, Memstore).
5. Add a dead letter queue to ensure consistency and that no data is lost in transit
6. Identify the most frequently used routes or services to create dedicated services and optimize scaling of the technical stack
7. Add our own analytics system to study user usage and define the most relevant functionalities (Google Analytics + Metabase for example)
8. Use a configured infrastructure with Terraform and all the other tools to automate the infrastruction provisioning
9. Use CI/CD platforms like Github Actions or cloud-native, to automate the test and deploy of the stack

## Resources

To build :

```bash
docker build -t tandem-analytics-client -f ./dockerfile/client.Dockerfile .
```
