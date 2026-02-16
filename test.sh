#!/bin/bash
echo "Testing HiveMind Dashboard..."
echo ""

# Test 1: Login
echo "1. Testing login..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"scott","password":"HiveMind2026!"}' \
  -c /tmp/hivemind_test_cookies.txt)

if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ Login successful"
else
    echo "❌ Login failed"
    exit 1
fi

# Test 2: Stats API
echo "2. Testing stats API..."
RESPONSE=$(curl -s http://localhost:3000/api/stats \
  -b /tmp/hivemind_test_cookies.txt)

if echo "$RESPONSE" | grep -q "totalAgents"; then
    echo "✅ Stats API working"
else
    echo "❌ Stats API failed"
    exit 1
fi

# Test 3: Agents API
echo "3. Testing agents API..."
RESPONSE=$(curl -s http://localhost:3000/api/agents \
  -b /tmp/hivemind_test_cookies.txt)

if echo "$RESPONSE" | grep -q "agents"; then
    echo "✅ Agents API working"
else
    echo "❌ Agents API failed"
    exit 1
fi

# Test 4: Departments API
echo "4. Testing departments API..."
RESPONSE=$(curl -s http://localhost:3000/api/departments \
  -b /tmp/hivemind_test_cookies.txt)

if echo "$RESPONSE" | grep -q "departments"; then
    echo "✅ Departments API working"
else
    echo "❌ Departments API failed"
    exit 1
fi

echo ""
echo "✅ All tests passed!"
rm /tmp/hivemind_test_cookies.txt
