# Logging stack

This stack collects logs from the NestJS `server` container, sends them through
Fluent Bit to Loki, and lets Grafana query Loki.

## Log flow

1. The root `docker-compose.yaml` configures the NestJS container to use Docker's
   `fluentd` logging driver with tag `nestjs`.
2. The Docker daemon forwards container log records to `127.0.0.1:24224`. The
   `fluent-bit` service publishes that host port and accepts the Fluent Forward
   protocol on container port `24224`.
3. Fluent Bit forwards every received record to `loki:3100` and adds the labels
   `job=no_name` and `source=fluent-bit`. The name `loki` resolves through Docker
   DNS because both services join the external `no_name` network.
4. Grafana queries Loki using the provisioned datasource URL
   `http://loki:3100`. Grafana and Loki also join `no_name`.

The Fluent Bit logging driver address is intentionally a host loopback address:
the Docker daemon makes that connection, not the NestJS container. Service-name
DNS is used by Fluent Bit and Grafana for their container-to-container traffic.

## Start and stop

From the repository root, run `./run.sh`. It creates the external `no_name`
network if needed, then starts the logging stack and the NestJS service. The
script currently runs `docker compose down -v` for the root stack before
starting; that removes volumes declared by that stack. The Loki and Grafana
data volumes belong to the separate `logs-service` Compose project.

Stop the services with:

```bash
docker compose -f docker-compose.yaml down
docker compose -f logs-service/docker-compose.yaml down
```

## Configuration inputs

Create `logs-service/.env` with these values before starting the stack:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `AWS_ACCESS_KEY_ID` | Loki | Credentials for the configured S3 object store |
| `AWS_SECRET_ACCESS_KEY` | Loki | Credentials for the configured S3 object store |
| `ADMIN_PASSWORD` | Grafana | Grafana admin account password |

The NestJS Compose service also reads `.env.test_supabase` from the repository
root. Keep both environment files private.

The service config files are `loki-config.yaml`,
`fluent-bit/fluent-bit.conf`, and `grafana-datasources.yaml`. Loki uses S3 for
the configured object store and a Docker volume for its `/loki` path. Grafana
stores its state in the `grafana-data` volume.

## Local endpoints

| Service | Host endpoint | Purpose |
| --- | --- | --- |
| NestJS | `http://localhost:3000` | Application API |
| Loki | `http://localhost:3100` | Loki HTTP API |
| Grafana | `http://localhost:3001` | Log dashboard; sign in as `admin` using `ADMIN_PASSWORD` |
| Fluent Bit | `127.0.0.1:24224` | Docker daemon's Fluent Forward log receiver |

## Verify and troubleshoot

Check the services with `docker compose -f logs-service/docker-compose.yaml ps`
and `docker compose ps`. In Grafana, open the Loki datasource health check; it
should report healthy when Loki is accepting requests. To inspect recent logs,
run `docker compose -f logs-service/docker-compose.yaml logs loki fluent-bit grafana`
and `docker compose logs server`.

If NestJS logs are missing, confirm Fluent Bit is running and listening on
`24224`, and that the root Compose logging driver points to
`127.0.0.1:24224`. If Loki or Grafana cannot reach Loki, confirm that the
external `no_name` network exists and both services are attached to it; use
`http://loki:3100` from containers, not `localhost:3100`.

There is no application JSON response for log ingestion: Docker's logging
driver, Fluent Bit's Forward input, and Loki's push/query APIs handle the log
records. Grafana's datasource health check reports success or an error status.
