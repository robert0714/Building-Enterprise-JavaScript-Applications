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

# deployment.yaml

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

NAME                             READY   STATUS    RESTARTS   AGE     LABELS
elasticsearch-7f98d7c4d6-5t5dd   1/1     Running   0          5m19s   app=elasticsearch,pod-template-hash=7f98d7c4d6
elasticsearch-7f98d7c4d6-cj2q7   1/1     Running   0          5m19s   app=elasticsearch,pod-template-hash=7f98d7c4d6
elasticsearch-7f98d7c4d6-tb94k   1/1     Running   0          5m19s   app=elasticsearch,pod-template-hash=7f98d7c4d6

```

Again, the name of the Pod is the name of its controlling ReplicaSet and a unique
hash.

You can also see that the Pods have a pod-template-hash=2557388109 label
applied to them. The Deployment and ReplicaSet use this label to identify which Pods it should be managing.

To find out more information about an individual Pod, you can run kubectl
describe pods <pod-name> , which will produce a human-friendly output:

```bash

$ kubectl describe pods elasticsearch-7f98d7c4d6-5t5dd 

Name:               elasticsearch-7f98d7c4d6-5t5dd
Namespace:          default
Priority:           0
PriorityClassName:  <none>
Node:               minikube/192.168.57.11
Start Time:         Fri, 15 Feb 2019 16:32:02 +0800
Labels:             app=elasticsearch
                    pod-template-hash=7f98d7c4d6
Annotations:        <none>
Status:             Running
IP:                 172.17.0.17
Controlled By:      ReplicaSet/elasticsearch-7f98d7c4d6
Containers:
  elasticsearch:
    Container ID:   docker://e632c8ccac133d52641d3447fb39e694cc34cddee46b2f6514b21fa2c5422cc9
    Image:          docker.elastic.co/elasticsearch/elasticsearch-oss:6.3.2
    Image ID:       docker-pullable://docker.elastic.co/elasticsearch/elasticsearch-oss@sha256:8ab8291e47460c686529dcbc1efedeb48bf983765cb93cbb4a55337f4ec256f4
    Ports:          9200/TCP, 9300/TCP
    Host Ports:     0/TCP, 0/TCP
    State:          Running
      Started:      Fri, 15 Feb 2019 16:32:11 +0800
    Ready:          True
    Restart Count:  0
    Environment:    <none>
    Mounts:
      /var/run/secrets/kubernetes.io/serviceaccount from default-token-gzvzm (ro)
Conditions:
  Type              Status
  Initialized       True 
  Ready             True 
  ContainersReady   True 
  PodScheduled      True 
Volumes:
  default-token-gzvzm:
    Type:        Secret (a volume populated by a Secret)
    SecretName:  default-token-gzvzm
    Optional:    false
QoS Class:       BestEffort
Node-Selectors:  <none>
Tolerations:     node.kubernetes.io/not-ready:NoExecute for 300s
                 node.kubernetes.io/unreachable:NoExecute for 300s
Events:
  Type    Reason     Age    From               Message
  ----    ------     ----   ----               -------
  Normal  Scheduled  7m45s  default-scheduler  Successfully assigned default/elasticsearch-7f98d7c4d6-5t5dd to minikube
  Normal  Pulled     7m39s  kubelet, minikube  Container image "docker.elastic.co/elasticsearch/elasticsearch-oss:6.3.2" already present on machine
  Normal  Created    7m36s  kubelet, minikube  Created container
  Normal  Started    7m36s  kubelet, minikube  Started container

```

Alternatively, you can get information about a Pod in a more structured JSON format by running kubectl get pod <pod-name> .


## Configuring Elasticsearch cluster

From the output of kubectl describe pods (or kubectl get pod ), we can see that the IP address of the Pod named elasticsearch-699c7dd54f-n5tmq is listed as 172.17.0.5 . Since our machine is the node that this Pod runs on, we can access the Pod using this private IP address.

The Elasticsearch API should be listening to port 9200 . Therefore, if we make a GET request to http://172.17.0.5:9200/ , we should expect Elasticsearch to reply with a JSON object:

```bash

$ curl http://172.17.0.5:9200/
{
  "name" : "CKaMZGV",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "dCAcFnvOQFuU8pTgw4utwQ",
  "version" : {
     "number" : "6.3.2",
     "lucene_version" : "7.3.1"
     ...
  },
  "tagline" : "You Know, for Search"
}

```
We can do the same for Pods elasticsearch-699c7dd54f-pft9k and elasticsearch-699c7dd54f-pm2wz , which have the IPs 172.17.0.4 and 172.17.0.6 , respectively:

```bash

$ kubectl get pods -l app=elasticsearch -o=custom-columns=NAME:.metadata.name,IP:.status.podIP

NAME IP
elasticsearch-699c7dd54f-pft9k 172.17.0.4
elasticsearch-699c7dd54f-n5tmq 172.17.0.5
elasticsearch-699c7dd54f-pm2wz 172.17.0.6

$ curl http://172.17.0.4:9200/
{
  "name" : "TscXyKK",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "zhz6Ok_aQiKfqYpzsgp7lQ",
  ...
}

$ curl http://172.17.0.6:9200/
{
  "name" : "_nH26kt",
  "cluster_name" : "docker-cluster",
  "cluster_uuid" : "TioZ4wz4TeGyflOyu1Xa-A",
  ...
}

```

Although these Elasticsearch instances are deployed inside the same Kubernetes cluster, they are each inside their own Elasticsearch cluster (there are currently three Elasticsearch clusters, running independently from each other). We know this because the value of cluster_uuid for the different Elasticsearch instances are all different.

However, we want our Elasticsearch nodes to be able to communicate with each other, so that data written to one instance will be propagated to, and accessible from, other instances.

Let's confirm that this is not the case with our current setup. First, we will index a simple document:

```bash

$ curl "172.17.0.6:9200/test/doc/1"
{"_index":"test","_type":"doc","_id":"1","_version":1,"found":true,"_source":{"foo":"bar"}}

$ curl "172.17.0.5:9200/test/doc/1"
{"error":{"type":"index_not_found_exception","reason":"no such index","index":"test"},"status":404}

$ curl "172.17.0.4:9200/test/doc/1"
{"error":{"type":"index_not_found_exception","reason":"no such index","index":"test"},"status":404}


```

Before we continue, it's important to make the distinction between an Elasticsearch cluster and a Kubernetes cluster. Elasticsearch is a distributed data storage solution, where all data is distributed among one or more shards, deployed among one or more nodes. An Elasticsearch cluster can be deployed on any machines, and is completely unrelated to a Kubernetes cluster. However, because we are deploying a distributed Elasticsearch services on Kubernetes, the Elasticsearch cluster now resides within the Kubernetes cluster.

## Networking for distributed databases

Due to the ephemeral nature of Pods, the IP addresses for Pods running a particular service (such as Elasticsearch) may change. For instance, the scheduler may kill Pods running on a busy node, and redeploy it on a more available node.

This poses a problem for our Elasticsearch deployment because:
* An Elasticsearch instance running on one Pod would not know the IP addresses of other instances running on other Pods
* Even if an instance obtains a list of IP addresses of other instances, this list will quickly become obsolete

This means that Elasticsearch nodes cannot discover each other (this process is called Node Discovery), and is the reason why changes applied to one Elasticsearch node is not propagated to the others.

To resolve this issue, we must understand how Node Discovery works in Elasticsearch, and then figure out how we can configure Kubernetes to enable discovery for Elasticsearch.

## Configuring Elasticsearch's Zen discovery

Elasticsearch provides a discovery module, called Zen Discovery, that allows different  Elasticsearch nodes to find each other.

By default, Zen Discovery achieves this by pinging ports 9300 to 9305 on each loopback address ( 127.0.0.0/16 ), and tries to find Elasticsearch instances that respond to the ping. This default behavior provides auto-discovery for all Elasticsearch nodes running on the same machine.

However, if the nodes reside on different machines, they won't be available on the loopback addresses. Instead, they will have IP addresses that are private to their network. For Zen Discovery to work here, we must provide a seed list of hostnames and/or IP addresses that other Elasticsearch nodes are running on.

This list can be specified under the discovery.zen.ping.unicast.hosts property inside Elasticsearch's configuration file elasticsearch.yaml . But this is difficult because:

* The Pod IP address that these Elasticsearch nodes will be running on is very likely to change
* Every time the IP changes, we'd have to go inside each container and update elasticsearch.yaml

Fortunately, Elasticsearch allows us to specify this setting as an environment variable.
Therefore, we can modify our deployment.yaml and add an env property under spec.template.spec.containers :

```yaml

containers:
- name: elasticsearch
  image: docker.elastic.co/elasticsearch/elasticsearch-oss:6.3.2
  ports:
  - containerPort: 9200
  - containerPort: 9300
  env:
  - name: discovery.zen.ping.unicast.hosts
    value: ""

```

## Attaching hostnames to Pods

But what should the value of this environment variable be? Currently, the IP addresses of the Elasticsearch Pods is random (within a large range) and may change at any time.

To resolve this issue, we need to give each Pod a unique hostname that sticks to the Pod, even if it gets rescheduled.

When you visit a website, you usually won't type the site's IP address directly onto the browser; instead, you'd use the website's domain name. Even if the host of the website changes to a different IP address, the website will still be reachable on the same domain name. This is similar to what happens when we attach a hostname to a Pod.

To achieve this, we need to do two things:
1. Provide each Pod with an identity using another Kubernetes Object called StatefulSet.
1. Attach a DNS subdomain to each Pod using a Headless Service, where the value of the subdomain is based on the Pod's identity.

## Working with StatefulSets

So far, we've been using the Deployment object to deploy our Elasticsearch service.The Deployment Controller will manage the ReplicaSets and Pods under its control and ensure that the correct numbers are running and healthy.

However, a Deployment assumes that each instance is stateless and works independently from each other. More importantly, it assumes that instances are fungible—that one instance is interchangeable with any other. Pods managed by a Deployment have identical identities.

This is not the case for Elasticsearch, or other distributed databases, which must hold stateful information that distinguishes one Elasticsearch node from another. These Elasticsearch nodes need individual identities so that they can communicate with each other to ensure data is consistent across the cluster.

Kubernetes provides another API Object called StatefulSet. Like the Deployment object, StatefulSet manages the running and scaling of Pods, but it also guarantees the ordering and uniqueness of each Pod. Pods managed by a StatefulSet have individual identities.

StatefulSets are similar to Deployments in terms of definition, so we only need to make minimal changes to our manifests/elasticsearch/deployment.yaml . 

First, change the filename to stateful-set.yaml , and then change the kind property to StatefulSet:

```properties

kind: StatefulSet

```

Now, all the Pods within the StatefulSet can be identified with a name. The name is composed of the name of the StatefulSet, as well as the ordinal index of the Pod:

```properties

<statefulset-name>-<ordinal>

```

## Ordinal index

The ordinal index, also known as ordinal number in set theory, is simply a set of numbers that are used to order a collection of objects, one after the other. Here, Kubernetes is using them to order, as well as identify each Pod. You can think of it akin to an auto-incrementing index in a SQL column.

The "first" Pod in the StatefulSet has an ordinal number of 0 , the "second" Pod has the ordinal number of 1 , and so on.

Our StatefulSet is named elasticsearch and we indicated 3 replicas, so our Pods will now be named elasticsearch-0 , elasticsearch-1 , and elasticsearch-2 .

Most importantly, a Pod's cardinal index, and thus its identity, is sticky—if the Pod gets rescheduled onto another Node, it will keep this same ordinal and identity.

## Working with services

By using a StatefulSet, each Pod can now be uniquely identified. However, the IP of each Pod is still randomly assigned; we want our Pods to be accessible from a stable IP address. Kubernetes provides the Service Object to achieve this.

The Service Object is very versatile, in that it can be used in many ways. Generally, it is used to provide an IP address to Kuberentes Objects like Pods.

The most common use case for a Service Object is to provide a single, stable, 
externally-accessible Cluster IP (also known as the Service IP) for a distributed service.
When a request is made to this Cluster IP, the request will be proxied to one of the Pods running the service. In this use case, the Service Object is acting as a load balancer.

However, that's not what we need for our Elasticsearch service. Instead of having a single cluster IP for the entire service, we want each Pod to have its own stable subdomain so that each Elasticsearch node can perform Node Discovery.

For this use case, we want to use a special type of Service Object called Headless Service. As with other Kubernetes Objects, we can define a Headless Service using a manifest file. Create a new file at manifests/elasticsearch/service.yaml with the following content:

```yaml

apiVersion: v1
kind: Service
metadata:
  name: elasticsearch
  spec:
    selector:
      app: elasticsearch
  clusterIP: None
  ports:
  - port: 9200
    name: rest
  - port: 9300
    name: transport

```

Let's go through what some of the fields mean:

* metadata.name : Like other Kuberentes Objects, having a name allows us to identify the Service by name and not ID.
* spec.selector : This specifies the Pods that should be managed by the Service Controller. Specifically for Services, this defines the selector to select all the Pods that constitute a service.
* spec.clusterIP : This specifies the Cluster IP for the Service. Here, we set
it to None to indicate that we want a Headless Service.
* spec.ports : A mapping of how requests are mapped from a port to the
container's port.

Let's deploy this Service into our Kubernetes cluster:
We don't need to actually run the Pods before we define a Service. A Service will frequently evaluate its selector to find new Pods that satisfy the selector.

```bash

$ kubectl apply -f manifests/elasticsearch/service.yaml
service "elasticsearch" created

```

We can run kubectl get service to see a list of running services:

```bash

$  kubectl get services
NAME            TYPE        CLUSTER-IP   EXTERNAL-IP   PORT(S)             AGE
elasticsearch   ClusterIP   None         <none>        9200/TCP,9300/TCP   23s
kubernetes      ClusterIP   10.96.0.1    <none>        443/TCP             2d2h



```
### Validation attatching a DNS subdomain to each pod

https://kubernetes.io/zh/docs/concepts/services-networking/dns-pod-service/#%E9%97%AE%E9%A2%98%E6%8E%92%E6%9F%A5%E6%8A%80%E5%B7%A7

https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/

https://kubernetes.io/docs/concepts/services-networking/service/#headless-services


## Linking StatefulSet to a service

First, let's remove our existing elasticsearch Deployment Object:

```bash

$ kubectl delete deployment elasticsearch

```

Now, the final step is to create our StatefulSet, which provides each Pod with a unique identity, and link it to the Service, which gives each Pod a subdomain. We do this by specifying the name of the Service as the spec.serviceName property in our StatefulSet manifest file:

```properties

...
spec:
  replicas: 3
  serviceName: elasticsearch
  ...

```

Now, the Service linked to the StatefulSet will get a domain with the following structure:

```
<service-name>.<namespace>.svc.<cluster-domain>
```

Our Service's name is elasticsearch . By default, Kubernetes will use the default namespace, and cluster.local as the Cluster Domain. Therefore, the Service Domain for our Headless Service
is elasticsearch.default.svc.cluster.local .

Each Pod within the Headless Service will have its own subdomain, which has the following structure:

```

<pod-name>.<service-domain>

```

Or if we expand this out:

```xml

<statefulset-name>-<ordinal>.<service-name>.<namespace>.svc.<cluster-domain>

```

Therefore, our three replicas would have the subdomains:

```preoperties

elasticsearch-0.elasticsearch.default.svc.cluster.local
elasticsearch-1.elasticsearch.default.svc.cluster.local
elasticsearch-2.elasticsearch.default.svc.cluster.local

```
https://www.ibm.com/support/knowledgecenter/zh/SSFPJS_8.5.6/com.ibm.wbpm.main.doc/topics/rfps_esearch_configoptions.html

## Updating Zen Discovery configuration

We can now combine these subdomains into a comma-separated list, and use it as the value for the discovery.zen.ping.unicast.hosts environment variable we are passing into the Elasticsearch containers. Update the manifests/elasticsearch/stateful-set.yaml file to read the following:

```yaml 
## manifests/elasticsearch/stateful-set.yaml

env:
- name: discovery.zen.ping.unicast.hosts
  value: "elasticsearch-0.elasticsearch.default.svc.cluster.local,elasticsearch-1.elasticsearch.default.svc.cluster.local,elasticsearch-2.elasticsearch.default.svc.cluster.local"

```

The final stateful-set.yaml should read as follows:

```yaml

apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
spec:
  replicas: 3
  serviceName: elasticsearch
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
          env:
            - name: discovery.zen.ping.unicast.hosts
              value:
                "elasticsearch-0.elasticsearch.default.svc.cluster.local,elasticsearch-1.elasticsearch.default.svc.cluster.local,elasticsearch-2.elasticsearch.default.svc.cluster.local"

```

Now, we can add this StatefulSet to our cluster by running kubectl apply :

```bash

$ kubectl apply -f manifests/elasticsearch/stateful-set.yaml

statefulset.apps "elasticsearch" created

```

We can check that the StatefulSet is deployed by running kubectl get statefulset :

```bash

$ kubectl get statefulsets

NAME              DESIRED CURRENT  AGE
elasticsearchh    3       3        42s

```

We should also check that the Pods are deployed and running:

```bash

$ kubectl get pods
NAME              READY   STATUS    RESTARTS   AGE
elasticsearch-0   1/1     Running   0          20s
elasticsearch-1   1/1     Running   0          15s
elasticsearch-2   1/1     Running   0          10s


```

Note how each Pod now has a name with the structure ```<statefulset-name>-<ordinal> ```.

Now, let's curl port 9200 of each Pod and see if the Elasticsearch Nodes have discovered each other and have collectively formed a single cluster. We will be using the -o flag of kubectl get pods to extract the IP address of each Pod. The -o flag allows you to specify custom formats for your output. For example, you can get a table of Pod names and IPs:

```bash
$ kubectl get pods -l app=elasticsearch -o=custom-columns=NAME:.metadata.name,IP:.status.podIP

NAME              IP
elasticsearch-0   172.17.0.16
elasticsearch-1   172.17.0.17
elasticsearch-2   172.17.0.18

```

We will run the following command to get the Cluster ID of the Elasticsearch node running on Pod elasticsearch-0 :

```bash
$ curl -s $(kubectl get pod elasticsearch-0 -o=jsonpath='{.status.podIP}'):9200 | jq -r '.cluster_uuid'

z8n4vOWMTQycKxU4fd2AZg


```

kubectl get pod elasticsearch-0 -o=jsonpath='{.status.podIP}' returns the IP address of the Pod. This is then used to curl the port 9200 of this IP; the -s flag silences the progress information
that cURL normally prints to stdout . Lastly, the JSON returned from Elasticsearch is parsed by the jq tool which extracts the cluster_uuid field from the JSON object.

The end result gives a Elasticsearch Cluster ID of pKtisDjpS1O27YrRlBAQWg . Repeat the same step for the other Pods to confirm that they've successfully performed Node Discovery and are part of the same Elasticsearch Cluster:

```bash

$ curl -s $(kubectl get pod elasticsearch-1 -o=jsonpath='{.status.podIP}'):9200 | jq -r '.cluster_uuid'

XGW-StSmRKeUvbWTUBm6QQ


$ curl -s $(kubectl get pod elasticsearch-2 -o=jsonpath='{.status.podIP}'):9200 | jq -r '.cluster_uuid'

-eeMnD5RQA2_1Tc1Ax5nUQ

```

Perfect! Another way to confirm this is to send a GET /cluster/state request to any one of the Elasticsearch nodes:

```bash

$ curl "$(kubectl get pod elasticsearch-2 -o=jsonpath='{.status.podIP}'):9200/_cluster/state/master_node,nodes/?pretty"

{
  "cluster_name" : "docker-cluster",
  "compressed_size_in_bytes" : 227,
  "master_node" : "wzj-uF0sQoKjj_roZD7ipw",
  "nodes" : {
    "wzj-uF0sQoKjj_roZD7ipw" : {
      "name" : "wzj-uF0",
      "ephemeral_id" : "_kR5Oz6yRJGoOtY2xMyRwg",
      "transport_address" : "172.17.0.18:9300",
      "attributes" : { }
    }
  }
}


```

what happened ?

```bash

$ kubectl get pods --namespace=kube-system -l k8s-app=kube-dns
NAME                       READY   STATUS             RESTARTS   AGE
coredns-86c58d9df4-4gwjj   0/1     CrashLoopBackOff   2          44s
coredns-86c58d9df4-9bfkr   0/1     CrashLoopBackOff   2          44s

```
Because kube-dns crashed !!!  we need to try another scenario 
ps . docker.elastic.co/elasticsearch/elasticsearch-oss:6.4.3


```bash

sudo -E minikube start --vm-driver=none   --memory 16384

# minikube ssh                         _             _            
            _         _ ( )           ( )           
  ___ ___  (_)  ___  (_)| |/')  _   _ | |_      __  
/' _ ` _ `\| |/' _ `\| || , <  ( ) ( )| '_`\  /'__`\
| ( ) ( ) || || ( ) || || |\`\ | (_) || |_) )(  ___/
(_) (_) (_)(_)(_) (_)(_)(_) (_)`\___/'(_,__/'`\____)


$ curl 172.17.0.7:9200/_cluster/state/master_node,nodes/?pretty
{
  "cluster_name" : "docker-cluster",
  "compressed_size_in_bytes" : 333,
  "cluster_uuid" : "r6ads3rSRWOPQrko8oYT3w",
  "master_node" : "LPmgwBLjTf6EWt1B63-v8w",
  "nodes" : {
    "Ddc_dqIsQJah5DthS40W0w" : {
      "name" : "Ddc_dqI",
      "ephemeral_id" : "pZlXc5fkTxyYhDXgkC8y8g",
      "transport_address" : "172.17.0.6:9300",
      "attributes" : { }
    },
    "LPmgwBLjTf6EWt1B63-v8w" : {
      "name" : "LPmgwBL",
      "ephemeral_id" : "dDS91MO7Sgm-XimJHvZCdw",
      "transport_address" : "172.17.0.5:9300",
      "attributes" : { }
    },
    "r9oG5BbyQl6f0K7t9dOq2A" : {
      "name" : "r9oG5Bb",
      "ephemeral_id" : "wub-ocCmS96nUhC1thG6dA",
      "transport_address" : "172.17.0.7:9300",
      "attributes" : { }
    }
  }
}

```



## Validating Zen Discovery

Once all ES nodes have been discovered, most API operations are propagated from one ES node to another in a peer-to-peer manner. To test this, let's repeat what we did previously and add a document to one Elasticsearch node and test whether you can access this newly indexed document from a different Elasticsearch node.

First, let's index a new document on the Elasticsearch node running inside the elasticsearch-0 Pod:

```bash

$ curl -X PUT "$(kubectl get pod  elasticsearch-0 -o=jsonpath='{.status.podIP}'):9200/test/doc/1" -H 'Content-Type:application/json' -d '{"foo":"bar"}'

{"_index":"test","_type":"doc","_id":"1","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":0,"_primary_term":1}

```

Now, let's try to retrieve this document from another Elasticsearch node (for example,the one running inside Pod elasticsearch-1 ):

```bash

$ curl -X PUT "$(kubectl get pod  elasticsearch-1  -o=jsonpath='{.status.podIP}'):9200/test/doc/1" {"_index":"test","_type":"doc","_id":"1","_version":1,"found":true,"_source":{"foo":"bar"}}


```

Try repeating the same command for elasticsearch-0 and elasticsearch-2 and confirm that you get the same result.

Amazing! We've now successfully deployed our Elasticsearch service in a distributed manner inside our Kubernetes cluster!

## Running commands on multiple servers


### Using init containers

ps. kubectl get all / kubectl delete statefullsets elasticsearch
```yaml
## statefull-set.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: elasticsearch
spec:
  replicas: 3
  serviceName: elasticsearch
  selector:
    matchLabels:
      app: elasticsearch
  template:
    metadata:
      name: elasticsearch
      labels:
        app: elasticsearch
    spec:
      initContainers:
      - name: increase-max-map-count
        image: busybox
        command:
        - sysctl
        - -w
        - vm.max_map_count=262144
        securityContext:
          privileged: true
      - name: increase-file-descriptor-limit
        image: busybox
        command:
        - sh
        - -c
        - ulimit -n 65536
        securityContext:
          privileged: true
      containers:
      - name: elasticsearch
        image: docker.elastic.co/elasticsearch/elasticsearch-oss:6.3.2
        ports:
        - containerPort: 9200
        - containerPort: 9300
        env:
        - name: discovery.zen.ping.unicast.hosts
          value: "elasticsearch-0.elasticsearch.default.svc.cluster.local,elasticsearch-1.elasticsearch.default.svc.cluster.local,elasticsearch-2.elasticsearch.default.svc.cluster.local"




```
