pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "vivek209/salary-service"
    }

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/Vivekiyer20/salary-cronjob-project.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $DOCKER_IMAGE:latest ./service'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin
                    docker push $DOCKER_IMAGE:latest
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                kubectl set image deployment/salary-service salary=$DOCKER_IMAGE:latest
                '''
            }
        }
    }
}
