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
or it crahed

```bash
$ kubectl logs elasticsearch-656d7c98c6-s6v58 
ERROR: [1] bootstrap checks failed
[1]: max virtual memory areas vm.max_map_count [65530] is too low, increase to at least [262144]
[2019-02-15T05:48:13,176][INFO ][o.e.n.Node               ] [PDuL9Ta] stopping ...
[2019-02-15T05:48:13,193][INFO ][o.e.n.Node               ] [PDuL9Ta] stopped
[2019-02-15T05:48:13,193][INFO ][o.e.n.Node               ] [PDuL9Ta] closing ...
[2019-02-15T05:48:13,205][INFO ][o.e.n.Node               ] [PDuL9Ta] closed

$ sudo sysctl -w vm.max_map_count=262144
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

apiVersion: apps/v1
kind: Deployment
metadata:
  name: elasticsearch
spec:
  replicas: 3
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      name: elasticsearch
      labels:
        app: elasticsearch
    spec:
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch-oss:6.3.2
        ports:
        - containerPort: 9200
        - containerPort: 9300

```

The configuration file consists of several fields (fields marked * are required):

* apiVersion* : The version of the API. This affects the scheme expected for
the configuration file. The API is broken into modular API Groups. This
allows Kubernetes to develop newer features independently. It also
provides Kubernetes cluster administrators more fine-grained control over
which API features they want to be enabled.
The core Kubernetes objects are available in the core group (the legacy group), and you can specify this by using v1 as the apiVersion property value. Deployments are available under the apps group, and we can enable this by using apps/v1 as the apiVersion property value. Other groups include batch (provides
the CronJob object), extensions , scheduling.k8s.io , settings.k8s.io , and many more.

* kind* : The type of resource this manifest is specifying. In our case, we want to create a Deployment, so we should specify Deployment as the value. Other valid values for kind include Pod and ReplicaSet , but for reasons mentioned previously, you wouldn't normally use them.

* metadata : Metadata about the Deployment, such as:

   * namespace : With Kubernetes, you can split a single physical cluster into multiple virtual clusters. The default namespace is default , which is sufficient for our use case.

   * name : A name to identify the Deployment within the cluster.

* spec : Details the behavior of the Deployment, such as:
   * replicas : The number of replica Pods, specified in the spec.template , to deploy.
   * template : The specification for each Pod in the ReplicaSet.
       * metadata : The metadata about the Pod,including a label property.
       * spec : The specification for each individual Pod:
           * containers : A list of containers that belong in the same Pod and should be managed together.
           * selector : The method by which the Deployment controller knows which Pods it should manage. We use the matchLabels criteria to match all  Pods with the label app: elasticsearch . We then set the label at  spec.template.metadata.labels .

## A note on labels

In our manifest file, under spec.template.metadata.labels , we've specified that
our Elasticsearch Pods should carry the label app: elasticsearch .

Label is one of two methods to attach arbitrary metadata to Kubernetes Objects, with the other being annotations.

Both labels and annotations are implemented as key-value stores, but they serve
different purposes:

* Labels: Used to identify an Object as belonging to a certain group of similar Objects. In other words, it can be used to select a subset of all Objects of the same type. This can be used to apply Kubernetes commands to only a subset of all Kubernetes Objects.

* Annotations: Any other arbitrary metadata not used to identify the Object.

A label key consists of two components—an optional prefix, and a name—separated by a forward slash ( / ).

The prefix exists as a sort of namespace, and allows third-party tools to select only the Objects that it is managing. For instance, the core Kubernetes components have a
label with a prefix of kubernetes.io/ .

Labeled Objects can then be selected using label selectors, such as the one specified in our Deployment manifest:

```yaml

selector:
  matchLabels:
    app: elasticsearch

```

This selector instructs the Deployment Controller to manage only these Pods and not others.

## Running pods declaratively with kubectl apply

With the Deployment manifest ready, we can run kubectl apply to update the desired state of our cluster:

```bash

$ kubectl apply -f manifests/elasticsearch/deployment.yaml deployment.apps "elasticsearch" created

```

This will trigger a set of events:
1. kubectl sends the Deployment manifest to the Kubernetes API server ( kube-apiserver ). kube-apiserver will assign it a unique ID, and adds it on to etcd .
1. The API server will also create the corresponding ReplicaSet and Pod Objects and add it to etcd .
1. The scheduler watches etcd and notices that there are Pods that have not been assigned to a node. Then, the scheduler will make a decision about where to deploy the Pods specified by the Deployment.
1. Once a decision is made, it will inform etcd of its decision; etcd records the decision.
1. The kubelet service running on each node will notice this change on etcd , and pull down a PodSpec – the Pod's manifest file. It will then run and manage a new Pod according to the PodSpec.

During the entire process, the scheduler and kubelets keep etcd up to date at all times via the Kubernetes API.

If we query for the state of the Deployment in the first few seconds after we run kubectl apply , we will see that etcd has updated its records with our desired state, but the Pods and containers will not be available yet:

```bash

$ kubectl get deployments

NAME          DESIRED CURRENT UP-TO-DATE AVAILABLE AGE
elasticsearch 3       3       3          0         2s
 

```
What do the numbers mean? 
* DESIRED —the desired number of
replicas; 
* CURRENT —the current number of replicas; 
* UP-TO-– the current number of replicas that has the most up-to-date configuration (has the copy of the latest Pod
template/manifest); 
* AVAILABLE —the number of replicas available to users

We can then run kubectl rollout status to be notified, in real-time, when each Pod is ready:

```bash

$ kubectl rollout status deployment/elasticsearch

Waiting for rollout to finish: 0 of 3 updated replicas are
available...
Waiting for rollout to finish: 1 of 3 updated replicas are
available...
Waiting for rollout to finish: 2 of 3 updated replicas are
available...
deployment "elasticsearch" successfully rolled out

```

Then, we can check the deployment again, and we can see that all three replica Pods are available:

```bash

$ kubectl get deployments

NAME          DESIRED CURRENT UP-TO-DATE AVAILABLE AGE
elasticsearch 3       3       3          3         2m

```

We have now successfully switched our approach from an imperative one (using kubectl run ), to a declarative one (using manifest files and kubectl apply ).

## Kubernetes Object management hierarchy
To solidify your understanding that our Deployment object is managing a ReplicaSet object, you can run kubectl get rs to get a list of ReplicaSet in the cluster:

```bash

$ kubectl get rs

NAME                      DESIRED CURRENT UP-TO-DATE AVAILABLE AGE
elasticsearchh-699c7dd54f 3       3       3          3         3m

```

The name of a ReplicaSet is automatically generated from the name of the Deployment object that manages it, and a hash value derived from the Pod template:

```xml

<deployment-name>-<pod-template-hash>

```

Therefore, we know that the elasticsearch-699c7dd54f ReplicaSet is managed by the elasticsearch Deployment.

Using the same logic, you can run kubectl get pods to see a list of Pods:

```bash

$ kubectl get pods --show-labels

NAME                           READY STATUS     LABELS
elasticsearch-699c7dd54f-n5tmq 1/1   Running    app=elasticsearch,pod-template-hash=2557388109
elasticsearch-699c7dd54f-pft9k 1/1   Running    app=elasticsearch,pod-template-hash=2557388109
elasticsearch-699c7dd54f-pm2wz 1/1   Running    app=elasticsearch,pod-template-hash=2557388109

```

Again, the name of the Pod is the name of its controlling ReplicaSet and a unique
hash.

You can also see that the Pods have a pod-template-hash=2557388109 label
applied to them. The Deployment and ReplicaSet use this label to identify which Pods it should be managing.

To find out more information about an individual Pod, you can run kubectl
describe pods <pod-name> , which will produce a human-friendly output:

```bash



```
