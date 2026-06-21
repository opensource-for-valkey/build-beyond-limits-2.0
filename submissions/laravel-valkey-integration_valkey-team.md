# Laravel Valkey Integration

---

## Attendee/Team Details

**Team Name:** Valkey Team
**GitHub Username:** opensource-for-valkey
**LinkedIn Profile:** https://www.linkedin.com/company/valkey-io
**GitHub Project Repository:** https://github.com/opensource-for-valkey/laravel-valkey

---

## Problem Statement Selected

```txt
Problem Statement #10 — Laravel: Add first-party integration of Valkey using GLIDE for PHP
```

---

## Project Description

This project adds first-party Valkey support to the Laravel framework using the [GLIDE for PHP](https://github.com/valkey-io/valkey-glide-php) client library.

* **What is it about?** A native Valkey integration for Laravel that replaces the existing Redis dependency with Valkey, providing caching, session management, queue backend, and broadcasting capabilities.
* **Who is it for?** Laravel developers who want to use Valkey — the open-source, Linux Foundation-backed key/value datastore — as their primary cache, session, and queue backend.
* **What problem does it solve?** Laravel currently only supports Redis for its key/value store needs. This integration provides a dedicated Valkey driver using the official GLIDE client, offering better cluster support, multiplexing, and long-term open-source alignment.
* **How does it help the user?** Developers can seamlessly switch from Redis to Valkey in their Laravel applications with minimal configuration changes, gaining access to Valkey's performance optimizations and community-driven development.

---

## Approach

* **Understanding the problem:** Laravel's cache, session, queue, and broadcasting subsystems all rely on a Redis connection. Valkey is a drop-in replacement for Redis 7.2, but a first-party driver using GLIDE provides better native support and cluster capabilities.
* **User flow:** Developers configure a `valkey` connection in `config/database.php`, set their cache/session/queue drivers to `valkey`, and the integration handles the rest transparently.
* **Features built:**
  - Valkey cache store driver
  - Valkey session handler
  - Valkey queue connector
  - Valkey broadcast driver
  - Cluster mode support via GLIDE
  - Connection pooling and multiplexing
* **How AI is used:** Breeth AI is used within the demo application frontend (React-based) to provide intelligent cache analytics and suggest optimal caching strategies based on usage patterns.
* **What makes this different:** Unlike simply pointing the existing Redis driver at a Valkey instance, this integration uses the official GLIDE for PHP client, which provides native cluster support, client-side caching, and multiplexing out of the box.

---

## Tech Stack and Tools Used

**Frontend:** React.js (demo application dashboard)
**Backend:** PHP 8.2+, Laravel 11.x
**Database:** Valkey 8.x (primary key/value store)
**AI Tools/API:** Breeth AI (cache analytics and optimization suggestions)
**Cloud/Deployment:** Docker, Docker Compose
**Other Tools:** GLIDE for PHP, Composer, PHPUnit, Pest

---

## Key Features

1. Native Valkey cache store with full Laravel Cache contract support
2. Valkey session handler with cluster-aware session management
3. Queue connector supporting delayed jobs, retries, and priority queues
4. Broadcasting driver for real-time event publishing via Valkey Pub/Sub
5. Cluster mode with automatic slot routing via GLIDE
6. Connection pooling and multiplexing for high-throughput scenarios
7. React-based demo dashboard with Breeth AI-powered cache insights

---

## What is Working?

- Valkey cache store driver (get, put, increment, decrement, forget, flush, tags)
- Valkey session handler (read, write, destroy, garbage collection)
- Connection management with GLIDE for PHP client
- Cluster mode configuration and routing
- Basic queue push/pop operations
- React demo app connecting to Laravel API
- Docker Compose setup for local development with Valkey

---

## What is Still in Progress?

- Broadcasting driver full implementation
- Rate limiting middleware using Valkey
- Comprehensive Pest test suite
- Performance benchmarks comparing GLIDE vs phpredis
- Laravel Artisan commands for Valkey cluster management
- Documentation and migration guide from Redis to Valkey

---

## Screenshots or Demo

**Deployed Link:** TBD
**Demo Video Link:** TBD
**Screenshots:** TBD

---

## Challenges Faced

- GLIDE for PHP is relatively new, requiring careful API mapping to Laravel's cache/session contracts
- Ensuring backward compatibility so existing Redis-based Laravel apps can migrate with minimal changes
- Handling cluster mode differences between standalone and clustered Valkey deployments
- Integrating React frontend with Laravel's existing Blade-based ecosystem for the demo

---

## Learnings

- Deep understanding of Laravel's cache, session, and queue service provider architecture
- GLIDE client internals including connection multiplexing and client-side caching
- Valkey's cluster slot routing and how it differs from standalone mode
- How to design a framework integration that is both powerful and easy to adopt

---

## Future Improvements

- Add support for Valkey Streams as a queue backend
- Implement client-side caching for frequently accessed keys
- Add Valkey Vector Search support for Laravel Scout
- Create a Laravel package (installable via Composer) for easy adoption
- Publish to Packagist as `valkey/laravel-valkey`
- Submit upstream PR to `laravel/framework` for native Valkey support

---

## Final Note

This project represents the Valkey community's commitment to first-party framework integrations. By providing a dedicated Laravel driver backed by the official GLIDE client, we aim to make Valkey the natural choice for Laravel developers who value open-source sustainability, performance, and community governance. We welcome contributions and feedback from the Laravel and Valkey communities alike.
