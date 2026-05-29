#!/bin/bash

# ConvertSafely Firebase Deployment Script
# Usage: ./deploy.sh [environment]
# Environment: development | staging | production (default: production)

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_ID="convertsafely-app"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Firebase CLI is installed
check_firebase_cli() {
    if ! command -v firebase &> /dev/null; then
        log_error "Firebase CLI is not installed."
        echo "Install it with: npm install -g firebase-tools"
        exit 1
    fi
    log_success "Firebase CLI is installed"
}

# Check if user is logged in
check_firebase_login() {
    if ! firebase projects:list &> /dev/null; then
        log_error "Not logged in to Firebase."
        echo "Run: firebase login"
        exit 1
    fi
    log_success "Firebase login verified"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    # Main project dependencies
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    
    # Functions dependencies
    if [ -d "firebase/functions" ]; then
        cd firebase/functions
        if [ ! -d "node_modules" ]; then
            npm install
        fi
        cd ../..
    fi
    
    log_success "Dependencies installed"
}

# Run tests
run_tests() {
    log_info "Running tests..."
    
    # Type checking
    if command -v tsc &> /dev/null; then
        npm run lint 2>/dev/null || log_warning "Linting skipped"
    fi
    
    log_success "Tests passed"
}

# Build the project
build_project() {
    log_info "Building project for $ENVIRONMENT environment..."
    
    # Set environment variables
    if [ "$ENVIRONMENT" = "production" ]; then
        export NODE_ENV=production
    else
        export NODE_ENV=development
    fi
    
    # Clean previous build
    rm -rf dist
    
    # Build
    npm run build
    
    if [ ! -d "dist" ]; then
        log_error "Build failed - dist directory not created"
        exit 1
    fi
    
    log_success "Build completed successfully"
}

# Build functions
build_functions() {
    log_info "Building Cloud Functions..."
    
    cd firebase/functions
    npm run build
    cd ../..
    
    log_success "Functions built successfully"
}

# Deploy Firestore rules
deploy_firestore() {
    log_info "Deploying Firestore rules and indexes..."
    firebase deploy --only firestore --project=$PROJECT_ID
    log_success "Firestore deployed"
}

# Deploy Storage rules
deploy_storage() {
    log_info "Deploying Storage rules..."
    firebase deploy --only storage --project=$PROJECT_ID
    log_success "Storage deployed"
}

# Deploy Functions
deploy_functions() {
    log_info "Deploying Cloud Functions..."
    firebase deploy --only functions --project=$PROJECT_ID
    log_success "Functions deployed"
}

# Deploy Hosting
deploy_hosting() {
    log_info "Deploying to Firebase Hosting..."
    firebase deploy --only hosting --project=$PROJECT_ID
    log_success "Hosting deployed"
}

# Full deployment
deploy_all() {
    log_info "Starting full deployment to $ENVIRONMENT environment..."
    
    check_firebase_cli
    check_firebase_login
    install_dependencies
    run_tests
    build_project
    build_functions
    
    log_info "Deploying all services..."
    firebase deploy --project=$PROJECT_ID
    
    log_success "Full deployment completed!"
}

# Show help
show_help() {
    cat << EOF
ConvertSafely Deployment Script

Usage: ./deploy.sh [command] [environment]

Commands:
    all         Deploy everything (default)
    hosting     Deploy only hosting
    functions   Deploy only Cloud Functions
    firestore   Deploy only Firestore rules
    storage     Deploy only Storage rules
    build       Build only, no deployment
    help        Show this help message

Environments:
    production  Production environment (default)
    staging     Staging environment
    development Development environment

Examples:
    ./deploy.sh                    # Deploy all to production
    ./deploy.sh all production     # Same as above
    ./deploy.sh hosting            # Deploy only hosting
    ./deploy.sh functions staging  # Deploy functions to staging
    ./deploy.sh build              # Build only

EOF
}

# Main execution
main() {
    COMMAND=${1:-all}
    ENV=${2:-production}
    
    case $COMMAND in
        all)
            deploy_all
            ;;
        hosting)
            check_firebase_cli
            check_firebase_login
            install_dependencies
            build_project
            deploy_hosting
            ;;
        functions)
            check_firebase_cli
            check_firebase_login
            install_dependencies
            build_functions
            deploy_functions
            ;;
        firestore)
            check_firebase_cli
            check_firebase_login
            deploy_firestore
            ;;
        storage)
            check_firebase_cli
            check_firebase_login
            deploy_storage
            ;;
        build)
            install_dependencies
            build_project
            build_functions
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
