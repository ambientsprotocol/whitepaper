# V. Execution Model {execution-model}

Encoding programs as distributed computation primitives lets us reason about the behavior of the programs and the systems they're part of intuitively. To ensure that programs are behaving correctly in decentralized, trustless networks, the programs must be interpreted and executed on a computer, such as a virtual machine, that fulfills the execution requirements. The execution requirements and environment are described as the protocol *execution model*.

This section describes the execution model for the protocol, by defining:

- A model to encode ambients and their discrete events as a distributed logs
- A finite-state machine that represents the state of an ambient
- The constraints and specifications that all protocol implementations must adhere to
- The verification procedures for the computations and state transitions

## Ambients as Logs

The protocol defines distributed programs as ambient expressions which form a set of parallel and nested ambients and a path according to which an ambient moves. A program is executed, i.e. run, by reducing its initial ambient expression to its final state. The [execution of a program](https://en.wikipedia.org/wiki/Execution_(computing)) makes the ambient move and change its state. To capture the ambient structures and movement and to be able to verify that programs were correctly executed, we define an [execution model](https://en.wikipedia.org/wiki/Execution_model) for the protocol based on distributed logs of discrete events structured as [Merkle-DAGs](https://discuss.ipfs.io/t/what-is-a-merkle-dag/386) [[65](#68f94b)].

A log consists of discrete events, which occur and are recorded during the execution of a program. Starting from an initial state the program follows the ambient reduction rules, step-by-step, to a final state. Every ambient in the system records its events to its own log and includes a signature to prove authenticity. During this process, every ambient records its own log, which includes a signature to prove authenticity. The aforementioned Merkle-DAG structure keeps the log [partially ordered](#partial-order) and preserves [cryptographic integrity](#integrity).

The state of an ambient, at any point in the execution, can be calculated from the events it has recorded in its log. It is the reductions, and in turn the events, that make ambients move and change their state. To look at it the other way around, the state of an ambient is recorded as immutable events in a distributed log. This enables us to analyze a program and its state at any given time in detail, to move back and forth between the states making, for example, [time-travel debugging](https://en.wikipedia.org/wiki/Time_travel_debugging) possible.

The recording of program execution as a log establishes the ambient structures, the expected instructions, that the correct instructions were executed and that the log contains only the expected events. This model enables any participant in the network to verify that the correct events were recorded by the correct participant at the correct time, and thus we can be sure that:

- A program was executed correctly
- A program behaved correctly

The safety properties of the protocol require that any protocol implementation and its underlying log must:

- [_Partially order_](#partial-order) its events
- Preserve the [_integrity_](#integrity) of its events
- Enable [_verification_](#verifiability) of its events

A database that provides a log abstraction, and guarantees the aforementioned properties can be used as a storage system in a protocol implementation. In the peer-to-peer world, blockchains and some DAGs, such as [Merkle-CRDTs](https://hector.link/presentations/merkle-crdts/merkle-crdts.pdf) [[39](#c21b4a)], can be used as the log. For example, solutions that meet all the requirements are [OrbitDB](https://github.com/orbitdb/orbit-db) [[46](#6c9acc)] and the Ethereum [blockchain](https://www.ethereum.org/) [[20](#001f73)]. There are several implementations that use a similar log structure, such as ["Feeds"](https://ssbc.github.io/scuttlebutt-protocol-guide/#feeds) [[51](#c6b702)] in [Secure Scuttlebutt](https://www.scuttlebutt.nz/) [[50](#452eb7)], ["Threads"](https://medium.com/textileio/wip-textile-threads-whitepaper-just-kidding-6ce3a6624338) [[4](#bfb036)] in [Textile](https://textile.io/) [[54](#b386b1)] and ["Hypercore"](https://github.com/mafintosh/hypercore) [[27](#f396b4)] used by the [Dat](https://dat.foundation/) [[17](#3ec99e)] protocol. These may be directly usable for the execution model described here.

The execution model doesn't set any strict requirements for exchanging messages between the network participants to communicate new events. The message exchange can be implemented through various mechanisms and is discussed in more detail in the chapter [Operating System and Networking Requirements](#the-virtual-machine).

### Partial Order

The execution model requires that events in a log are at least partially ordered. [Partial order](https://en.wikipedia.org/wiki/Partially_ordered_set) means that, for some events in the log, we don't know which came first, so they are considered *concurrent*. That is, they happened at the same time and the [causal order](https://lamport.azurewebsites.net/pubs/time-clocks.pdf) [[60](#db71ae)] between them can't be determined.

With partial ordering as the baseline consistency requirement, the execution model captures parallel execution of computation through concurrent events and stronger consistency guarantees can be achieved either through the log implementation or at the application level. For example, a total order can be derived from a partial order by giving a partially ordered log a [total sorting function](https://arxiv.org/pdf/1805.04263.pdf) [[45](#9e91aa)] or using a [blockchain as the underlying log](http://sites.computer.org/debull/A16mar/p39.pdf) [[24](#5a52fa)].

Most importantly, partial ordering enables [eventual consistency](https://en.wikipedia.org/wiki/Eventual_consistency) which removes the need for participants to synchronize, reducing the consensus and coordination overhead to a minimum. This in turn greatly benefits the overall network throughput and significantly contributes to better scalability.

### Integrity

Integrity of the computation and data is a crucial safety property in the execution model. The execution model requires all events to be *unforgeable* and *immutable* after they've been written to a log. As a corollary, all logs must guarantee their structural integrity, which means that the order of the events in a log must also be *unforgeable* and *immutable*.

*Unforgeability* can be achieved by signing each event with a public signing key of the creator of the event. The signature works as a proof that it was created by the owner of the signing key. Upon receiving an event, participants verify the signature against the event data and the given public key. If the signature verifies, the participant can be sure that the event wasn't forged.

*Immutability* can be achieved by structuring the events as Merkle-DAGs in a [content-addressed storage system](https://en.wikipedia.org/wiki/Content-addressable_storage). When persisted, the content-addressed storage returns a hash to the event Merkle-DAG, which is then used to reference that event. The Merkle-DAG structure guarantees that a) any change to the event data or its references would change its hash and b) upon receiving the event its contents match the given hash. Together, these two properties establish *immutability* and *unforgeability* of the events.

### Verifiability

To guarantee that distributed programs are executed and behave correctly, the execution model requires that its properties are easily and reliably verifiable. The execution model is *verifiable* if integrity and the order and authenticity of events can be verified by the network participant. This means that verification of the logs and events must be fast, simple, cheap, and reproducible for expected and unexpected behavior.

The main mechanism for verification is the [event data structure](#event-data-structure) and its representation as a Merkle-DAG. The event data, explained in detail in the [Event Data Structure](#event-data-structure) section, contains all the necessary information to verify its contents as well as its authenticity. The Merkle-DAG data structure, in turn, enables us to verify the order of the events and integrity of data and communications, that is, we can be sure that the data we received was the data we requested.

Performing the verifications at runtime is the responsibility of the [virtual machine](#the-virtual-machine).

## Logs

Logs are a [unifying abstraction](https://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying) [[64](#43c4e1)] and an [indispensable tool](https://martinfowler.com/eaaDev/EventSourcing.html) [[22](#1998e6)] in designing and implementing distributed systems that collect multiple events into one logical data structure. Executing a program generates events that are linked together as a Merkle-DAG, forming a log. The events are hashed as [Merkle-trees](http://www.merkle.com/papers/Certified1979.pdf) [[3](#e90b3d)] making them cryptographically secure and giving each event an immutable content-address. Merkle-DAGs, or [Merkle-trees](https://en.wikipedia.org/wiki/Merkle_tree), are a well-known and researched data structure [widely used](https://en.wikipedia.org/wiki/Merkle_tree#Uses) especially in peer-to-peer and crypto-currency technologies. 

A log is created by defining a *[manifest](#identities-and-addresses)* object for the log. Each ambient and the events from their reductions are written to their own log.

Every event in a log has a *log identifier*. The identifier establishes which log a particular event belongs to. An identifier is distinct for every log and is assigned by the executor of a program. A distinct log identifier ties the events of a program together with the executor and protects against forged events.

Every event contains an _operation_, which specifies the ambient capability or co-capability that was "consumed" in a reduction step. For example, the events recorded by the next reduction step for a program `a[in_ b] | b[in a]` - the operations would be `in_ b` and `in a` respectively. Recording the operation in the events allows us to check the events against the expected events and to be sure that they match the expected order and protocol primitives.

Every event contains one or more links or references to the previous events in the log. Events linked together form the DAG-structure: `A ← B ← C ← D`. The links between the events define the *partial order* of events, establish the *integrity* of a log and allows traversing the log backwards in order to verify all the events in the log (that is, the full program execution). An event and its order, as part of a Merkle-DAG, can't be changed without changing the hashes of all subsequent events establishes *immutability* of the event and the log. That means that events can't be inserted to the history of a log making a log tamper-proof. Due to the movement of ambients from one ambient to another, events sometimes refer to events in other logs that form the sub-parts of a program and become part of a larger DAG describing the system and its execution. 

Referencing the events all the way to the beginning of the execution establishes an isolated execution path. That is, the hash of the root event gives a unique id for the execution of the program and separates it from other calls to the same program. This construction is important as it solves the [interference problem](#ambient-capabilities) present in ambient calculus.

Every event is cryptographically signed by the executor of the program and the public key used to sign the event is included. Signing the events establishes authenticity: any participant can verify that the event was indeed produced and recorded by the log owner. The signature is created by hashing the log id, operation, creator, payload address, and refs of the event, then signing the generated hash and adding it to the signature field of the event. Referencing the previous events form the causal order, i.e. a timestamp, and including the references in the signature protects the log from [replay attacks](https://en.wikipedia.org/wiki/Replay_attack).

Parallel composition of ambients  (and thus parallel execution of a program or its sub-parts) are represented as unions of Merkle-DAGs. For example, the ambient `a[b[] | c[]]` forms a DAG as a union of the two independent sub-DAGs isolated from each other. The individual DAGs can be considered as [slices of the program](#defining-programs), and subsets of the full program. This definition is important; when events are passed to other logs and participants, the receiver can only access the minimum slice of the program needed, while other parts of the program remain hidden and inaccessible to the receiver. Only the originating ambient knows all the events of the log and is able to reconstruct the full program. A receiver of an event can only reconstruct the part of the program ("slice") that the event refers to.

Events produced by the [protocol primitive ambients](#protocol-primitives) (*func, arg, call, return*) are embedded in the logs of their parent ambients and they don't have their own logs. For example, events produced by executing `call` and `return` primitives are embedded in the logs of the caller and the callee. Having a separate log for each primitive would add coordination overhead between participants.

At any time, a log has a single writer which makes it clear who the executor is, who has control over an ambient and to which log they should write to, clearly separating the participants and their responsibilities. Since signing an event requires the possession of a private signing key, logs can only be written *locally*. As such, on the network level, the coordination overhead stays minimal while executing a program, and participants can make progress individually. The result is extremely low latency updates, as those happen on the local devices first. Consequently, applications have a user experience that feels faster than when an application needs to make a request to a server and wait for the response. Thus, applications can work even disconnected from the network, offline.

## Events

The discrete events recorded in the logs are the result of the ambient calculus reduction steps when a program is executed. They occur at some point in time, and different events are separated in time. Events of a reduction can also happen in parallel, or *concurrently*, which results in one or more ambients recording their events at the same (logical) time. Additionally, the Robust Ambients' calculus rules define that to reduce a capability, a matching co-capability is also reduced. Hereby, there are actually two events that happen at every reduction: one event for reducing the capability (e.g. `in`) and one event for reducing the matching co-capability (e.g. `in_`). The execution model defines this as the [duality of capabilities and co-capabilities](#duality-of-capabilities-and-co-capabilities).

In this section, we define a set of rules, which guarantee that the computation primitives are always recorded and verified in the same deterministic order. Even though the computation primitive ambients internally can run in parallel and have no deterministic ordering, the rules of the execution model define a specific, known-in-advance order in which the computation primitives work, and are recorded, in relation to each other. This guarantee has useful consequences:

- The events of a distributed program have causal ordering and the log forms a partially ordered set (where the causality is represented by DAGs)
- Running a distributed program will eventually converge to a deterministic end result
- The event for the end result becomes the *least upper bound* of the partially ordered set and the finished program forms a [join-semilattice](https://en.wikipedia.org/wiki/Semilattice) (for a more formal definition, the reader is advised to refer to the [Merkle-CRDTs paper](https://hector.link/presentations/merkle-crdts/merkle-crdts.pdf) [[39](#c21b4a)])
- Parallel computations are isolated and do not interfere with each other

### Event Data Structure

An event consists of:

- An `id` that establishes which log the event belongs to
- An `op` which contains the event name, as per the [bytecode format](#the-bytecode-format), and any required arguments for the event
- A `public key` of the creator of the event
- A `signature` to establish authenticity
- A set of `references` to the previous events in the program execution
- An optional `payload` containing the hash of computed value (included _if and only if_ the [program slice](#defining-programs) was fully executed)

For example, an event recorded upon reducing `in a`, which hashes to `zdpuApuYgEmSfLjSXhkhtTww78Eg9Rz5wobu2BnBqPBVSksRU`, would be represented in JSON as (*complete hashes truncated for brevity*):

```
{
  id: 'zdpuArPwAFjAJqbJYwW714H362twiSMF1TX6H5T7L...',
  op: 'in a',
  sig: '30440220264d3bab838066d856087779af511afe...',
  creator: { 
    id: 'zdpuAwkLw7KAgXSEqduQQoyo9MrpkWrKDrKtBUg...',
    publicKey: '04c9680e7399c5d9589df2b62f32d568...',
  },
  refs: [ 
    'zdpuAmofe9Wk44ZbvMojdYPqBZ5xdrY5b8UWZmZFop4...',
    'zdpuB2UnPayCXCENwbu4bH72okXDQYfeQ8bhJk2VsPF...'
  ]
}
```

### Creating Ambients

When starting a program, a `create` event is first written to the log of the program. The `create` event contains the name of the ambient which declares the existence of an ambient. For example, an ambient `a[in b.open_]` would produce an event with an op `create a`. The internal structure of an ambient, e.g. `in b.open_`, is recorded as a `deploy` event discussed in the [Program Definition chapter](#defining-programs). Subsequently, throughout the execution of the program, when a nested ambient is created, a `create` event is recorded. A log can thus contain several `create` events that were generated by the same program.

As with other events, the `create` event data structure references the previous events in the program execution, linking the nested ambients to their parent. This connection makes it possible to find the path from any event back to its parent ambient and all the way to the root ambient, the start of the program execution. The references establish the causality between the parent ambient and its nested ambients, which means the parent ambient is always created before the ambients it contains.

### Defining Programs

After the existence of an ambient is declared with a `create` event, it is directly followed by a `deploy` event. The `deploy` event defines what the expected next steps of the program are. During the verification, the information in a `deploy` event is used to check against the events recorded in a log. To know if what happened was correct, we need to know what was supposed to happen. The `deploy` provides the verifier with this information, making it a core data structure that allows *verifiability* of the program behavior. It also allows the verifier to check where and when new capabilities were adopted.

If an ambient contains parallel nested ambients, a concurrent `deploy` event is created for each nested ambient. For example, the ambient `a[b[open_] | c[open_]]`, would create two concurrent `deploy` events, one for `b[open_]` and one for `c[open_]`, both referring to the `create a` event of their parent ambient `a`. Subsequently, `b[open_]` and `c[open_]` would respectively first record `create b` and `create c` followed by `deploy open_` and `deploy open_` events.

Separating the creation and deployment of the sub-parts of the program has two important consequences. 

First, it allows a program to be *[sliced](https://en.wikipedia.org/wiki/Program_slicing)* to its sub-parts which enables parallel, isolated execution of the parts of the program. *Slices* of a program can be distributed to the network to be executed by other network participants.

Second, *slicing* a program prevents information leakage, that is, to not reveal information about a program which shouldn't be revealed to network participants. A participant receiving an event needs to be able to traverse all the way to the root ambient to verify its source, name and expected steps, but it should not learn about the other, parallel sub-parts of the parent program. If a program was defined using only the `create` event, the receiver would learn everything about the program: all parallel ambients of the program, what other calls were made, and to whom, and more. Separating the `deploy` event from the `create` event, provides the necessary structure to keep parts of the program hidden from the other parts. This enables network participants to execute and verify a sub-part of the program, but they can't reconstruct the full program.

For example, a program that makes 100 function calls that are not dependent on each other can be distributed to 100 different network participants, each participant being oblivious of the other 99 function calls executed by the other participants.

Defining a `deploy` event and separating it from the `create` event constitutes the core structure and mechanism for verifiably distributing and executing programs in a network.

The program defined by the `deploy` event is referred to by its [address](#identities-and-addresses), which is included in the `deploy` event.

### Duality of Capabilities and Co-capabilities

The Robust Ambients calculus' reduction rules specify that a reduction finishes only when a capability and its respective co-capability are both consumed at the same time. We call this connection the *duality of capabilities and co-capabilities*. 

The duality is reflected in the log events by the definition that 1) there's a direct reference between the capability and co-capability events and 2) there are no other recorded events between them.

The events for co-capabilities `in` and `out` reference the matching event of the `in` and `out` capabilities. For example, executing a program `a[call[out a] | out call]` creates the event `out a` in the log of `a` followed by the matching event `out call` which refers to the previous event: `out a ← out call`. This forms the verifiable link between the request to move in or out of an ambient, the authority that the moving ambient was allowed to do so and a record that the ambient has indeed moved.

The `open` and `open_` are ordered differently than `in` and `out`. The `open` capability references the matching `open_` co-capability, e.g. `open_ ← open a`. Opening an ambient gives new capabilities to its opener. For example, when the ambient `a[in b.open_]` enters ambient `b[in_ a.open a]`, ambient `b` adopts the `open_` capability from `a`. The capabilities adopted by the opening ambient can be deduced from the `deploy` events referred to by the `open` event and its previous events. Interestingly, this leads to an observation that the only event that can refer to an `open_` event is the respective `open` event.

### Transferring Control

During the execution of a program, ambients can move out of their parent ambients and into other ambient. Moving into another ambient is marked by the `in` capability, and recording it in an event defines that the control of the ambient has been transferred from its parent to the ambient it enters.

For example, reducing the ambient `a[in b] | b[in_ a]` generates an event with an op `in b` in the log of `a`. Given the [duality of capabilities and co-capabilities](#duality-of-capabilities-and-co-capabilities), a concurrent event `in_ a` is recorded in the log of `b`.

As the control of the ambient is passed to another ambient, the `in` capability is special compared to the other capabilities: when an `in` event is recorded, the control of the ambient has been passed to the destination ambient, after which the parent ambient has no control over that ambient. The destination ambient, then, adopts the remaining capabilities of the entering ambient. For example, when the ambient `a[in b.open_]` enters ambient `b[in_ a.open a]`, ambient `b` adopts the `open_` capability from `a`. In turn, the destination ambient will record the events produced by the adopted capabilities to its own log (as opposed to writing them to the parent ambient's log, or the parent ambient continuing to write the events to its own log). This minimizes the need for synchronization between the parent and destination ambients, which means that they can continue the program execution independently and in isolation of each other. The definition of transferring the control is thus a construction that allows programs to be distributed efficiently to network participants.

The control transfer sets some requirements for recording the `in` event. Because the control is transferred and the destination ambient adopts the remaining capabilities from the parent ambient, the `in` event must make sure that all capabilities and ambients of the parent are transferred. To achieve this, every `in` event references the previous events, like other events do, but in addition it references all the *"heads"* (that is, a union of events that no other event in the log points to) of the ambients and capabilities that are nested inside of the moving ambient.

### Evaluating Results

When the control is transferred back to the caller, the caller's virtual machine has all the information it needs to evaluate the result of the computation. 

The evaluation of the result happens by inspecting the log of events the remote participant has generated, starting from the received `in` event. Because the last recorded `in` event contains a reference to all the _heads_ in the execution DAG, the caller can traverse the log all the way back to the `in` event that started the remote execution and thus determine the runtime state of the program evaluation.

If all the heads in the `in` event refer to a program that has no unconsumed capabilities or co-capabilities left to consume, the VM determines that the program evaluation has entered a constant and immutable state, a final [value](#values). This value is then evaluated by the VM to its [primitive data type](#primitive-data-types). Optionally, VM can use the remotely precomputed results, accessible via content-address in event `payload`. Consider the string concatenation monoid:

```
string[
  concat[
    left[string[a[]]]|
    right[string[b[]]]
  ]
]
```

The value represented by the ambients, as constructed from the log, is evaluated to `"ab"` by the string implementation of the [Virtual Machine](#the-virtual-machine). This value is then returned by the [State Machine](#state-machine) upon querying the current state of the program.

Upon receiving the `in` event, having verified and evaluated the resulting value, the caller records the evaluation action by writing an `open_` event to the log of the returned program. The caller then writes an `open` event, to the log of the calling program, which references the previous `open_` and the content-address of the final state as a `payload`, thereby concluding the evaluation of the result.

## Identities and Addresses

Deploying a program creates a root manifest file. This file contains the program "bytecode" and the public signing key of the deployer. The manifest is then signed by the deployer to prevent forging of program deployments. The manifest file is hashed and the hash of the manifest is the identifier of the program.

The identifier in turn is used to construct a *program address*. The program address consists of the protocol prefix and the identifier, separated by `/`. For example, if the manifest hashes to `zdpuAwAdomEUPx54FZVLt33ZeGZ5VrJkTgLxQiUZNBwZ3kr7e`, the address of the program can be represented as (*complete hash truncated for brevity*): 

```
/amb/zdpuAwAdomEUPx54FZVLt33ZeGZ5VrJkTgLxQiUZNBwZ3...
```

The address establishes [location transparency](https://www.lightbend.com/ebooks/reactive-microsystems-evolution-of-microservices-scalability-oreilly) [[49](#952882)]: a single, logical address, to which messages can be sent to and which is always available, regardless of *where* the program is run. If hashes are identifiers to *immutable* content in a content-addressed system, then an identifier for a program in the Ambients protocol is an identifier to *mutable* content. 

This effectively means that a program in an address is like a database or service that can be queried.

Sending messages and listening to this address, the network participants exchange messages about the latest events. Upon receiving events, participants apply them to their local copy of the log. To verify that an event is valid for a log, the receiver 1) fetches the manifest from the content-addressed network 2) reads the "keys" field from the manifest 3) checks that the creator's public signing key defined in the event is present in the "keys" field. If the key is found from the manifest, if the log id in the event matches the manifest hash and if the signature of the event verifies, the receiver can establish that the creator of the event is allowed to write the event to the log.

The manifest contains:

- `program`, which is the hash of the [program bytecode](#program-bytecode) and by which the program bytecode can be retrieved from a content-addressed storage
- `name`, to describe the program
- `keys`, which is an address to a list of keys that are allowed to write to the log of the program
- `creator`, which identifies the creator of the program and their public signing key
- `signature`, to establish authenticity of manifest

For example, a manifest that hashes to `zdpuAyJe8DpoEAbs2z3djcNs2XnQBPExisJuqfpo4mygDmLXK`, would be presented in JSON as (*complete hashes truncated for brevity*):
```
{
  program: 'zdpuAkfNT6xd5mC3Jk3ZNMGrjoqqRqSKTLjU...',
  name: 'hello-world',
  keys: '/amb/zdpuAuTSoDhKKgAfjJBRvWw4wSg5r6b3oW...',
  creator: { 
    id: 'zdpuAwkLw7KAgXSEqduQQoyo9MrpkWrKDrKtBUg...',
    publicKey: '04c9680e7399c5d9589df2b62f32d568...'
  }
  signature: '30440220264d3bab838066d856087779af...',
}
```

The manifest defines the keys of the participants who are allowed to execute the program, which means they're able to write to the log of the program. The "keys" field contains an address which, when resolved, returns a list of keys. The address can be either an immutable file or an address of another ambient program that works as mutable list of keys, for example an access controller program.

Each sub-part of the program creates their own manifest and attaches the address of the manifest to the `deploy` event created by that sub-part.

Separating the manifests per sub-program keeps the full program information hidden. This means that knowing an address of a sub-part of the program doesn't reveal the address of the full program. Only the deployer of the program has the address of the full program. The deployer can give the address to others if they wish to share the program with them. By not giving the address to others, the program and its state or result stays hidden. Knowing the address is considered having "read access". However, to keep the program bytecode, its access control information and meta data confidential, the fields in the manifest file can also be encrypted.

Defining the keys in the manifest allows the deployer to define a) who can call the deployed program, e.g. only the creator, a set of nodes or anyone, and b) when requesting a computation from the network, e.g. calling a function, who can execute that function for the deployer. This allows granular access control and lets deployer define a specific, for example a "trusted", set of participants for a program or parts of it. 

In addition, the manifest can be used to describe other useful information, such as encryption keys to enforce confidential computation between the participants. The granularity makes it possible to define authorization or encryption on a per-function-call level, which means that for example granting or revoking access can be done at any point in time.

## Runtime Environment

Programs are executed by a [runtime environment](https://en.wikipedia.org/wiki/Runtime_system). We define the runtime environment for the protocol as a [virtual machine](https://en.wikipedia.org/wiki/Virtual_machine).

### The Virtual Machine

The runtime, defined as a *virtual machine* (VM), is software that takes the program's compiled bytecode as an input, verifies that the bytecode is valid, executes the instructions defined by the program, writes the events to the log, communicates with other participants in the network and verifies events received from them, interfaces with the operating system, handles and manages keys for signing and encryption, and more. 

The purpose of the VM is to provide a platform-independent runtime environment to run programs in a sandboxed and isolated environment, limiting the access to the underlying operating system and hardware. It abstracts away the details of the underlying systems and hardware allowing a program to be executed the same way on any platform. For example, a VM for the protocol implemented in JavaScript can be run on Node.js or in the browsers, and a VM implemented in Rust can be run as a native program on a chosen operating system, both being able to run the same programs and communicate with each other.

Network participants running programs on the virtual machines form a network. The VM is responsible for distributing the computational workload to the network participants: it can decide to run a computation locally, or only parts of it locally and to request other parts to be computed by the network. Multiple programs can be run at the same time and a single program can perform multiple computations in parallel. It is the responsibility of the VM to coordinate and [schedule](https://en.wikipedia.org/wiki/Scheduling_(computing)) the computation workloads to the appropriate resources. The VM is also responsible for communicating with the network and its participants, handling identities, signing and authenticating messages, and ultimately verifying that the protocol is followed. All VMs in the network have the responsibility to verify the remote programs upon execution and to refuse executing any invalid or incorrectly behaving programs. Incorrect behavior also includes [compilers](#translating-ambients-programs) generating invalid executables and VMs failing to carry out their responsibilities, whether due to implementation errors (i.e. bugs) or malicious intent.

The VM keeps track of the program execution and encapsulates its state using [state machines](#state-machine).

The VM works as an interface between the programs and the operating system. It provides APIs for the programs to access operating system level services. This includes for example, an access to storage to persist data, networking functionality to communicate with the network, and cryptographic primitives for hashing or encryption. The VM also implements primitive data types, such as *integers* or *strings*, and provides a core library for the programs to use. The required data types and interfaces are defined in [Primitive Data Types](#primitive-data-types) and [System Interface](#system-interface).

The VMs are free to do optimizations internally to make the execution of programs more efficient. For example, optimizations could include pre-fetching programs or logs from the network, optimizing network topologies or using program type information for more efficient evaluation of computation results.

### Discovery

In order to distribute programs and have them run by other network participants, the execution model defines that a _discovery_ mechanism is used to become aware of programs and participants willing to execute them. 

The discovery mechanism itself is not strictly defined by the execution model and implementations are free to use various mechanisms or protocols to perform the discovery. In general and at minimum, the discovery mechanism should communicate the [address](#identities-and-addresses) of the program or the hash of the [program bytecode](#program-bytecode), in order to establish that the correct program is verifiably executed by the remote participants.

For example, a Publish-Subscribe mechanism, a marketplace that connects those wishing to distribute a program and those willing to execute it, a private network or system with existing discovery service, or even out-of-band mechanisms can all be used to connect the participants and exchange the program information.

### State Machine

The virtual machine uses a [finite-state machine](https://en.wikipedia.org/wiki/Finite-state_machine) for each program. The state machines track the state of the program: where the execution of the program is at any given time, the possible next steps and the [result](#evaluating-results) of the program. In other words, the state machine represents the computed value of a program.

The state machine takes a log of events as its input and outputs the current state. To do this, the state machine replays the events by starting from the first event and applying each event to the current state, updating its state on each event. Upon receiving a new event from the network, the event is passed after verification to the state machine's update function, which triggers the calculation of the new state. If all events required to change the state have been received, the state machine proceeds to the next state through a a state transition.

The state machine is internal to the VM and is not exposed to the user.

### Primitive Data Types

The virtual machine implements a set of common, [primitive data types](https://en.wikipedia.org/wiki/Primitive_data_type) such as strings, numerals, arrays, and more. The implementation of the primitive data types, and the functions to operate on them (e.g. *addition* or *multiplication* operations on integers) allows the VM to encode and decode between the event data and typed runtime data to efficiently evaluate and handle such types.

Depending on the source language a program is written in, the primitive data types can be built-in to the source programming language or they can be exposed to the user through a library.

The detailed list of primitive data types to be implemented by the virtual machines will be defined in the future. For now, we envision at least the following types to be included, and upon which to expand in the future:

- Booleans
- Integers
- Floating-point numbers
- Bytes
- Characters
- Strings
- Tuples
- Lists

### System Interface

The system interface provides a unified way for programs to use operating system services across all platforms. The programs will want to persist data on disk, to be able to communicate with other participants in the network, to use cryptographic keys and functions, and more. The system interface exposes this functionality to the programs and the virtual machine manages the calls to the actual services.

It is important to separate the system level calls from the application and protocol level, as it draws a clear line between what the protocol can guarantee and what it cannot: *all requests and responses to the operating system are* ***not*** *verifiable by the protocol*. That is, the user must trust their execution environment, i.e. the virtual machine and the operating system, to function correctly.

The system level services, accessed through the system interface, are I/O operations. From the system perspective, they cause side effects and as the system calls can go all the way down to the hardware level, the protocol can't verify that the I/O actually happened. However, all system interface services, except the Untrusted Code Execution Interface, are required to be deterministic in a way that they return either failure or always the same result for same input.

As a rule, programs using the system interface are executable by any node in the network, so all virtual machines must implement the system interface. The Untrusted Code Execution Interface is the exception to this rule, and programs using it are not expected to be run by all nodes, only by a subset of the network.

Having a unified system interface for all programs allows the virtual machines, i.e. the protocol implementations, to use different components as part of their implementation. This allows different storage backends to be used and the user can choose the storage according to their needs. For example, in a trustless environment an application could choose to use a Merkle-tree-based content-addressed storage system, such as [IPFS](https://ipfs.io) [[29](#59ac11)], whereas in a trusted system, the users could opt to use a traditional database system.

The exact APIs for the system interface will be specified in the detailed protocol specification. We envision the interfaces to provide access to at least the following services:

**Content-addressed Storage** provides a file system and a data storage layer and can be used to store arbitrary data in various formats and persist files in directory hierarchies. The programs can fetch data, download files or list contents of a directory through the storage interface.

**Peer-to-Peer Networking** provides functionality to manage connections to other participants on the system and network level. The programs can request the system to open a connection to a certain participant, to discover new participants through DHT and other discovery mechanisms, or to join a group communication channel through a Pubsub system.

A **Cryptography Interface** provides secure cryptography functionality to the programs. Signing and encryption keys can be generated, signatures can be verified and data decrypted through the interface. Keys can be stored and managed through the interface. For example, a wallet for a crypto-currency, such as an Ethereum, could be used as the underlying implementation.

The **Untrusted Code Execution Interface** provides a way to access untrusted or highly hardware-dependent services of the system. For example, random number generators and time APIs can be accessed through the interface. Programs that require specific binaries to be available in the operating system, or require communication with external systems, such as to make calls to smart contracts or to location-addressed systems, can use the untrusted code execution interface to access those services. However, since the interface allows access to arbitrary functionality, not all participants in a network will support all the same functionality. The support for specific services through the Untrusted Code Execution Interfaces depends on each individual participant.

The relationship and the order of the layers from a program down to the operating system level can be described with the following diagram:

```
+-----------------------------------------------+
|                   Program                     |
+-----------------------------------------------+
|                     VM                        |
+-----------------------------------------------+
|               System Interface                |
+-------+-------+------+------------------------+
|Storage|Network|Crypto|Untrusted Code Execution|
+-------+-------+------+------------------------+
```
