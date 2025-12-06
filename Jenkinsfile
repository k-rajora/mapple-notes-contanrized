pipeline {
    agent any

    environment {
        // --- 1. CONFIGURATION (UPDATE THESE) ---
        AWS_REGION     = "ap-south-1"
        AWS_ACCOUNT_ID = "123456789012"      // <--- REPLACE with your AWS Account ID
        CLUSTER_NAME   = "maple-notes-cluster"
        
        // ECR Repository Names
        ECR_FRONTEND   = "maple-notes-frontend"
        ECR_BACKEND    = "maple-notes-backend"
        
        // Dynamic Image Tag
        IMAGE_TAG      = "v${env.BUILD_NUMBER}"
    }

    stages {
        
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // --- MOVED UP: Security Scan First ---
        stage('Security Scan (Trivy)') {
            steps {
                echo "Running Security Scan..."
                // Scans the current directory for HIGH/CRITICAL vulnerabilities
                // "exit-code 0" warns but continues. Change to "1" to fail the build on error.
                sh "trivy fs --severity CRITICAL --exit-code 0 ."
            }
        }

        // --- MOVED DOWN: Code Quality Second ---
        stage('Code Quality (SonarQube)') {
            steps {
                script {
                    echo "Running Code Quality Analysis..."
                    def scannerHome = tool 'SonarScanner'
                    
                    // The plugin automatically injects the token you saved in Jenkins System settings
                    withSonarQubeEnv('MySonarServer') {
                        sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=maple-notes \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=http://localhost:9000
                        """
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    // 1. Login to AWS ECR
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

                    // 2. Build & Push Backend
                    echo "Building Backend..."
                    sh "docker build -t ${ECR_BACKEND}:${IMAGE_TAG} ./backend"
                    sh "docker tag ${ECR_BACKEND}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BACKEND}:${IMAGE_TAG}"
                    sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BACKEND}:${IMAGE_TAG}"

                    // 3. Build & Push Frontend
                    echo "Building Frontend..."
                    sh "docker build -t ${ECR_FRONTEND}:${IMAGE_TAG} ./frontend"
                    sh "docker tag ${ECR_FRONTEND}:${IMAGE_TAG} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_FRONTEND}:${IMAGE_TAG}"
                    sh "docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_FRONTEND}:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to EKS') {
            steps {
                script {
                    // 1. Connect kubectl to EKS
                    sh "aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}"

                    // 2. Update Image Tags in Manifests
                    dir('ops/kubernetes') {
                        echo "Updating Kubernetes Manifests with Image Tag: ${IMAGE_TAG}"
                        
                        // Update Backend Image
                        sh "sed -i 's|image: .*${ECR_BACKEND}.*|image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BACKEND}:${IMAGE_TAG}|' app-deployment.yaml"
                        
                        // Update Frontend Image
                        sh "sed -i 's|image: .*${ECR_FRONTEND}.*|image: ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_FRONTEND}:${IMAGE_TAG}|' app-deployment.yaml"
                        
                        // 3. Apply to Cluster
                        sh "kubectl apply -f ."
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
            // Clean up Docker images to save space
            sh "docker rmi ${ECR_BACKEND}:${IMAGE_TAG} || true"
            sh "docker rmi ${ECR_FRONTEND}:${IMAGE_TAG} || true"
            sh "docker rmi ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_BACKEND}:${IMAGE_TAG} || true"
            sh "docker rmi ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_FRONTEND}:${IMAGE_TAG} || true"
        }
    }
}
