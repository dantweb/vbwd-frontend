#!/bin/bash

# Pre-commit check script for vbwd-frontend
# Usage:
#   ./bin/pre-commit-check.sh                    # Run only style checks (eslint, vue-tsc) for all
#   ./bin/pre-commit-check.sh --admin            # Run style checks for admin only
#   ./bin/pre-commit-check.sh --user             # Run style checks for user only
#   ./bin/pre-commit-check.sh --unit             # Run style checks + unit tests
#   ./bin/pre-commit-check.sh --integration      # Run style checks + integration tests
#   ./bin/pre-commit-check.sh --e2e              # Run style checks + e2e tests (playwright)
#   ./bin/pre-commit-check.sh --admin --unit --no-style  # Run only unit tests for admin (no style)
#   ./bin/pre-commit-check.sh --all              # Run everything

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"

# Default values
RUN_ADMIN=false
RUN_USER=false
RUN_STYLE=true
RUN_UNIT=false
RUN_INTEGRATION=false
RUN_E2E=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --admin)
            RUN_ADMIN=true
            shift
            ;;
        --user)
            RUN_USER=true
            shift
            ;;
        --no-style)
            RUN_STYLE=false
            shift
            ;;
        --unit)
            RUN_UNIT=true
            shift
            ;;
        --integration)
            RUN_INTEGRATION=true
            shift
            ;;
        --e2e)
            RUN_E2E=true
            shift
            ;;
        --all)
            RUN_ADMIN=true
            RUN_USER=true
            RUN_STYLE=true
            RUN_UNIT=true
            RUN_INTEGRATION=true
            RUN_E2E=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --admin         Run checks for admin app only"
            echo "  --user          Run checks for user app only"
            echo "  --no-style      Skip style checks (eslint, vue-tsc)"
            echo "  --unit          Run unit tests"
            echo "  --integration   Run integration tests"
            echo "  --e2e           Run e2e tests (playwright)"
            echo "  --all           Run all checks for both apps"
            echo "  --help, -h      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                           # Style checks for all"
            echo "  $0 --admin --unit            # Style + unit tests for admin"
            echo "  $0 --admin --unit --no-style # Unit tests only for admin"
            echo "  $0 --all                     # Everything for both apps"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# If no app specified, run for both
if [[ "$RUN_ADMIN" == "false" && "$RUN_USER" == "false" ]]; then
    RUN_ADMIN=true
    RUN_USER=true
fi

# Track overall success
OVERALL_EXIT=0

# Function to print section header
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to run style checks for admin
run_admin_style() {
    print_header "Admin: Style Checks"

    cd "$FRONTEND_DIR"

    # ESLint
    echo "Running ESLint for admin..."
    if docker-compose run --rm admin-test sh -c "npm install --silent && npm run lint 2>&1" ; then
        print_success "ESLint passed"
    else
        print_error "ESLint failed"
        OVERALL_EXIT=1
    fi

    # TypeScript check
    echo ""
    echo "Running TypeScript check for admin..."
    if docker-compose run --rm admin-test sh -c "npm install --silent && npx vue-tsc --noEmit 2>&1" ; then
        print_success "TypeScript check passed"
    else
        print_error "TypeScript check failed"
        OVERALL_EXIT=1
    fi
}

# Function to run style checks for user
run_user_style() {
    print_header "User: Style Checks"

    cd "$FRONTEND_DIR"

    # ESLint
    echo "Running ESLint for user..."
    if docker-compose run --rm user-test sh -c "npm install --silent && npm run lint 2>&1" ; then
        print_success "ESLint passed"
    else
        print_error "ESLint failed"
        OVERALL_EXIT=1
    fi

    # TypeScript check
    echo ""
    echo "Running TypeScript check for user..."
    if docker-compose run --rm user-test sh -c "npm install --silent && npx vue-tsc --noEmit 2>&1" ; then
        print_success "TypeScript check passed"
    else
        print_error "TypeScript check failed"
        OVERALL_EXIT=1
    fi
}

# Function to run unit tests for admin
run_admin_unit() {
    print_header "Admin: Unit Tests"

    cd "$FRONTEND_DIR"

    echo "Running unit tests for admin..."
    if docker-compose run --rm admin-test sh -c "npm install --silent && npx vitest run tests/unit/ 2>&1" ; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        OVERALL_EXIT=1
    fi
}

# Function to run unit tests for user
run_user_unit() {
    print_header "User: Unit Tests"

    cd "$FRONTEND_DIR"

    echo "Running unit tests for user..."
    if docker-compose run --rm user-test sh -c "npm install --silent && npx vitest run vue/tests/unit/ 2>&1" ; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        OVERALL_EXIT=1
    fi
}

# Function to run integration tests for admin
run_admin_integration() {
    print_header "Admin: Integration Tests"

    cd "$FRONTEND_DIR"

    echo "Running integration tests for admin..."
    if docker-compose run --rm admin-test sh -c "npm install --silent && npx vitest run tests/integration/ 2>&1" ; then
        print_success "Integration tests passed"
    else
        print_error "Integration tests failed"
        OVERALL_EXIT=1
    fi
}

# Function to run integration tests for user
run_user_integration() {
    print_header "User: Integration Tests"

    cd "$FRONTEND_DIR"

    echo "Running integration tests for user..."
    # Check if user has integration tests directory
    if docker-compose run --rm user-test sh -c "test -d vue/tests/integration" 2>/dev/null; then
        if docker-compose run --rm user-test sh -c "npm install --silent && npx vitest run vue/tests/integration/ 2>&1" ; then
            print_success "Integration tests passed"
        else
            print_error "Integration tests failed"
            OVERALL_EXIT=1
        fi
    else
        print_warning "No integration tests directory found for user"
    fi
}

# Function to run e2e tests for admin
run_admin_e2e() {
    print_header "Admin: E2E Tests (Playwright)"

    cd "$FRONTEND_DIR"

    echo "Running e2e tests for admin..."
    # E2E tests need playwright browsers, use playwright image
    if docker run --rm \
        -v "$FRONTEND_DIR/admin/vue:/app" \
        -v "$FRONTEND_DIR/core:/core" \
        -w /app \
        mcr.microsoft.com/playwright:v1.40.0-jammy \
        sh -c "npm install --silent && npx playwright install --with-deps chromium && npx playwright test 2>&1" ; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        OVERALL_EXIT=1
    fi
}

# Function to run e2e tests for user
run_user_e2e() {
    print_header "User: E2E Tests (Playwright)"

    cd "$FRONTEND_DIR"

    echo "Running e2e tests for user..."
    # E2E tests need playwright browsers, use playwright image
    if docker run --rm \
        -v "$FRONTEND_DIR/user:/app" \
        -v "$FRONTEND_DIR/core:/core" \
        -w /app \
        mcr.microsoft.com/playwright:v1.40.0-jammy \
        sh -c "npm install --silent && npx playwright install --with-deps chromium && npx playwright test 2>&1" ; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        OVERALL_EXIT=1
    fi
}

# Main execution
echo -e "${BLUE}Pre-commit Check Script${NC}"
echo "========================"
echo ""
echo "Configuration:"
echo "  Admin:       $RUN_ADMIN"
echo "  User:        $RUN_USER"
echo "  Style:       $RUN_STYLE"
echo "  Unit:        $RUN_UNIT"
echo "  Integration: $RUN_INTEGRATION"
echo "  E2E:         $RUN_E2E"

# Run style checks
if [[ "$RUN_STYLE" == "true" ]]; then
    if [[ "$RUN_ADMIN" == "true" ]]; then
        run_admin_style
    fi
    if [[ "$RUN_USER" == "true" ]]; then
        run_user_style
    fi
fi

# Run unit tests
if [[ "$RUN_UNIT" == "true" ]]; then
    if [[ "$RUN_ADMIN" == "true" ]]; then
        run_admin_unit
    fi
    if [[ "$RUN_USER" == "true" ]]; then
        run_user_unit
    fi
fi

# Run integration tests
if [[ "$RUN_INTEGRATION" == "true" ]]; then
    if [[ "$RUN_ADMIN" == "true" ]]; then
        run_admin_integration
    fi
    if [[ "$RUN_USER" == "true" ]]; then
        run_user_integration
    fi
fi

# Run e2e tests
if [[ "$RUN_E2E" == "true" ]]; then
    if [[ "$RUN_ADMIN" == "true" ]]; then
        run_admin_e2e
    fi
    if [[ "$RUN_USER" == "true" ]]; then
        run_user_e2e
    fi
fi

# Summary
echo ""
print_header "Summary"

if [[ "$OVERALL_EXIT" == "0" ]]; then
    print_success "All checks passed!"
else
    print_error "Some checks failed!"
fi

exit $OVERALL_EXIT
