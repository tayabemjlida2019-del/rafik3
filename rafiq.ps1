# Al-Rafiq Platform Automated Launcher (Bypass Encoding Issues)

function Write-Host-Color ($message, $color) {
    Write-Host "[$color] $message" -ForegroundColor $color
}

Write-Host-Color "Starting Al-Rafiq Platform..." "Cyan"

# 1. Check Prerequisites
Write-Host-Color "Checking prerequisites..." "Yellow"

if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host-Color "Node.js not found. Please install Node.js." "Red"
    exit 1
}

if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host-Color "Docker Compose not found. Please install Docker." "Red"
    exit 1
}

docker info >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host-Color "Docker is not running. Please start Docker Desktop." "Red"
    exit 1
}

# 2. Clean Ports
Write-Host-Color "Cleaning up ports 3005 and 3001..." "Yellow"
$ports = @(3005, 3001)
foreach ($port in $ports) {
    $proc = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host-Color "Stopping process on port $port..." "Cyan"
        Stop-Process -Id $proc.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Write-Host-Color "Starting Docker containers..." "Yellow"
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host-Color "Failed to start Docker containers." "Red"
    exit 1
}

# 3. Wait for DB
Write-Host-Color "Waiting for database to be ready..." "Yellow"
$retries = 10
while ($retries -gt 0) {
    $health = docker inspect --format='{{json .State.Health.Status}}' rafiq_db
    if ($health -eq '"healthy"') {
        Write-Host-Color "Database is healthy!" "Green"
        break
    }
    Write-Host "Waiting... ($retries left)"
    Start-Sleep -Seconds 5
    $retries--
}

# 4. Install Deps
if (!(Test-Path "node_modules")) {
    Write-Host-Color "Installing root dependencies..." "Yellow"
    npm install
}

# 5. Setup API
Write-Host-Color "Setting up API..." "Yellow"
Set-Location "apps/api"
if (!(Test-Path "node_modules")) {
    npm install
}
npx prisma migrate deploy
npx prisma db seed

# 6. Setup Web
Write-Host-Color "Setting up Web Frontend..." "Yellow"
Set-Location "../../apps/web"
if (!(Test-Path "node_modules")) {
    npm install
}
if (!(Test-Path ".env.local")) {
    "NEXT_PUBLIC_API_URL=http://localhost:3001" | Out-File -FilePath ".env.local" -Encoding utf8
}

# 7. Setup Mobile
Write-Host-Color "Setting up Mobile App..." "Yellow"
Set-Location "../../apps/mobile"
if (!(Test-Path "node_modules")) {
    npm install
}

Set-Location "../.."

# 8. Launch Everything
Write-Host-Color "Launch everything..." "Green"
Write-Host-Color "API: http://localhost:3001" "Cyan"
Write-Host-Color "Web: http://localhost:3005" "Cyan"
Write-Host-Color "Mobile: Open Expo Go on your phone" "Yellow"

$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi*","Ethernet*" | Select-Object -First 1).IPAddress
Write-Host-Color "Your Local IP: $ip (Automatically updated in mobile app)" "Magenta"

# Update Mobile API Client IP automatically
$clientPath = "apps/mobile/src/api/client.ts"
if (Test-Path $clientPath) {
    $content = Get-Content $clientPath
    $updatedContent = $content -replace "const BASE_URL = 'http://.*:3001';", "const BASE_URL = 'http://$ip:3001';"
    $updatedContent | Set-Content $clientPath
}

Start-Process "http://localhost:3005"

Write-Host-Color "Tip: Use 'npm run dev:all' to start everything including Mobile." "Cyan"
npx -y concurrently --kill-others --names "API,WEB" --prefix-colors "magenta,cyan" "npm run dev:api" "npm run dev:web"
