/**
 * K6 Load Test Script for TrustBank API
 * 
 * Usage:
 *   k6 run k6/load-test.js
 * 
 * Scenarios:
 *   - Smoke test: 5 VUs for 30s
 *   - Load test: ramp up to 100 VUs over 5 minutes
 *   - Stress test: ramp up to 500 VUs (uncomment stress scenario)
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const loginDuration = new Trend('login_duration');
const transferDuration = new Trend('transfer_duration');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';

export const options = {
    scenarios: {
        smoke: {
            executor: 'constant-vus',
            vus: 5,
            duration: '30s',
            gracefulStop: '5s',
        },
        load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '1m', target: 50 },
                { duration: '3m', target: 100 },
                { duration: '1m', target: 0 },
            ],
            gracefulStop: '10s',
            startTime: '35s', // start after smoke
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms, 99% under 1s
        errors: ['rate<0.05'], // Error rate < 5%
    },
};

export default function () {
    let token;

    group('Authentication', () => {
        const loginPayload = JSON.stringify({
            email: 'admin@bank.com',
            password: 'Admin@123',
        });

        const loginRes = http.post(`${BASE_URL}/api/v1/auth/login`, loginPayload, {
            headers: { 'Content-Type': 'application/json' },
        });

        loginDuration.add(loginRes.timings.duration);

        const loginSuccess = check(loginRes, {
            'login status is 200': (r) => r.status === 200,
            'login returns token': (r) => {
                try {
                    const body = JSON.parse(r.body);
                    return body.data && body.data.token;
                } catch (e) {
                    return false;
                }
            },
        });

        errorRate.add(!loginSuccess);

        if (loginSuccess) {
            token = JSON.parse(loginRes.body).data.token;
        }
    });

    if (!token) {
        sleep(1);
        return;
    }

    const authHeaders = {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    };

    group('Account Operations', () => {
        // Get accounts
        const accountsRes = http.get(`${BASE_URL}/api/v1/account/my-accounts`, authHeaders);
        check(accountsRes, {
            'accounts status is 200': (r) => r.status === 200,
        });

        // Health check
        const healthRes = http.get(`${BASE_URL}/actuator/health`);
        check(healthRes, {
            'health is UP': (r) => r.status === 200,
        });
    });

    sleep(1); // Simulate user think time
}
