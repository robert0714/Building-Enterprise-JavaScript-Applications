## Running Pods with kubectl run

First, confirm that no Elasticsearch containers are currently running on our machine:

```bash

$ docker ps -a \
--filter "name=elasticsearch" \
--format "table {{.ID}}\t{{.Image}}\t{{.Command}}\t{{.Names}}"

CONTAINER ID IMAGE COMMAND NAMES

```

We can now use kubectl run to run an image inside a Pod, and deploy it onto our cluster:

```bash

$ kubectl run elasticsearch --image=docker.elastic.co/elasticsearch/elasticsearch-oss:6.3.2 --port=9200 --port=9300

deployment.apps "elasticsearch" created

```

Now, when we check the Pods that have been deployed onto our cluster, we can see a new elasticsearch-656d7c98c6-s6v58 Pod:

```bash

$ kubectl get pods
NAME READY STATUS RESTARTS AGE
elasticsearch-656d7c98c6-s6v58 0/1 ContainerCreating 0 9s

```

It may take some time for the Pod to initiate, especially if the Docker image is not available locally and needs to be downloaded. Eventually, you should see the READY value become 1/1 :

```bash

$ kubectl get pods
NAME READY STATUS RESTARTS AGE
elasticsearch-656d7c98c6-s6v58 1/1 Running 0 1m

```

## Understanding high-level Kubernetes objects

The more observant of you might have noticed the following output after you ran kubectl :

```bash

deployment.apps "elasticsearch" created

```

When we run kubectl run , Kubernetes does not create a Pod directly; instead, Kubernetes automatically creates a Deployment Object that will manage the Pod for us. Therefore, the following two commands are functionally equivalent:

```bash

$ kubectl run <name> --image=<image>
$ kubectl create deployment <name> --image=<image>

```

To demonstrate this, you can see a list of active Deployments using kubectl get deployments :

```bash

$ kubectl get deployments
NAME            DESIRED   CURRENT   UP-TO-DATE    AVAILABLE    AGE
elasticsearch   1         1         1             1            2s

```

The benefit of using a Deployment object is that it will manage the Pods under its control. This means that if the Pod fails, the Deployment will automatically restart the Pod for us.

Generally, we should not imperatively instruct Kubernetes to create a low-level object like Pods, but declaratively create a higher-level Kubernetes Object and let Kubernetes manage the low-level Objects for us.

This applies to ReplicaSet as well—you shouldn't deploy a ReplicaSet; instead, deploy a Deployment Object that uses ReplicaSet under the hood.

## Declarative over imperative

Pods, Deployments, and ReplicaSet are examples of Kubernetes Objects. Kubernetes provides you with multiple approaches to run and manage them.

* kubectl run —imperative: You provide instructions through the command line to the Kubernetes API to carry out

* kubectl create —imperative: You provide instructions, in the form of a configuration file, to the Kubernetes API to carry out 

* kubectl apply —declarative: You tell the Kubernetes API the desired state of your cluster using configuration file(s), and Kubernetes will figure out the operations required to reach that state

kubectl create is a slight improvement to kubectl run because the configuration file(s) can now be version controlled; however, it is still not ideal due to its imperative nature.

If we use the imperative approach, we'd be manipulating the Kubernetes object(s) directly, and thus be responsible for monitoring all Kubernetes objects. This essentially defeats the point of having a Cluster Management Tool.

The preferred pattern is to create Kubernetes Objects in a declarative manner using a version-controlled manifest file.

|Management technique             |Operates on         | Recommended environment | Supported writers | Learning curve |
|---------------------------------|--------------------|-------------------------|-------------------|----------------|
|Imperative commands              |Live objects        |1+                       |Lowest             |
|Imperative object configuration  |Individual files    |1                        |Moderate           |
|Declarative object configuration |Directories of files|1+                       |Highest            |

You should also note that the imperative and declarative approaches are mutually exclusive—you cannot have Kubernetes manage everything based on your configuration, and also manipulate objects on your own. Doing so will cause Kubernetes to detect the changes you've made as deviations from the desired state,and will work against you and undo your changes. Therefore, we should consistently use the declarative approach.

## Deleting deployment

With this in mind, let's redeploy our Elasticsearch service in a declarative manner, using kubectl apply . But first, we must delete our existing Deployment. We can do that with kubectl delete :

```bash

$ kubectl delete deployment elasticsearch

$ kubectl get deployments

No resources found.

```

## Creating a deployment manifest

Now, create a new directory structure at manifests/elasticsearch , and in it, create a new file called deployment.yaml . Then, add the following Deployment configuration:

```yaml



```