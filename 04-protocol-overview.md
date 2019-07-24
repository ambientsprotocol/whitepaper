# II. Protocol Overview {protocol-overview}

To understand the need for the Ambients protocol, let's consider the challenges that developers currently face with prevailing programming models during the paradigm shift.

The paradigm shift from platform-centric model to a decentralized one requires the decentralized applications to be equally as good or better than the ones offered by the platforms. Reversing the authority is only one of the steps. To succeed in creating better user experiences, we need to build our applications and services accordingly. The current programming models for decentralized applications and services unfortunately resemble the platforms: they use a database which is effectively centralized, often times a blockchain.

With this in mind, consider that databases are a combination of a storage (the database state) and programs to access, update and query the storage (the database services). Relational databases commonly offer [SQL](https://en.wikipedia.org/wiki/SQL) as an interface to update and query the database, making SQL an interoperability layer for all programs that wish to access and manipulate the database state. Smart contract platforms work the same way: blockchains are the centralized database state and smart contracts provide the database services and an interface. In a way, all centralized platforms form around a centralized database to which the data moves into. In fact, such a database model shifts the decentralized web towards the centralized platform model.

What happens when the database state is decentralized and local to its owner? The whole concept of a database is inverted: the database state no longer accumulates in one single place, but in multiple places in a network. Therefore, to have a true decentralized programming model equivalent to the traditional database-centric model, the database services (or any program) need to move to where the data is. To do so, the computation (the programs) needs to be distributed.

It turns out, solving this problem means much more than just getting decentralized databases.

## Ambients protocol Summary

The Ambients protocol connects decentralized applications and networks by defining a programming model for distributed programs and a peer-to-peer distribution and computation network to run and share them.

Programs leveraging the Ambients protocol are turned into distributed executables that can be executed safely in the Ambients network. This lets the programs move where the data is. Sharing these distributed programs is essential for the interoperability and scalability of decentralized applications, for example when building the aforementioned decentralized, local-to-its-owner database where the programs form the distributed database services. The deployment and execution of the distributed programs is discussed in detail in the later [chapters](#execution-model).

The Ambients programming model is restrictive enough to be verifiably safe. At the same time, it is expressive enough to let developers build data structures, functions, algorithms, business logic, databases, even full-fledged systems and services. Most programming languages today have an Ambients-compliant subset of features, which means that developers can build their decentralized applications and services on the Ambients protocol using a familiar programming language. The translation of a program to a distributed program using the Ambients protocol is discussed in detail in the later [chapters](#compilation-model).

The Ambients protocol is designed to be platform-independent. The Ambients network can overlay and connect multiple different Ambients-compliant runtime environments, from trusted, permissioned centralized systems (like traditional web services) to trustless, permissionless decentralized systems (like blockchain platforms). The details of Ambients-compliant runtime environments are discussed in more detail in the later [chapters](#runtime-environment).

The Ambients protocol is open source, and free for everyone to build on.

## Properties of the Ambients protocol

Realizing that program distribution is essential for true decentralized applications, the quality and safety of the programs become an extremely important aspect. Including third-party code is a risk to the application quality and its users, both from a functional and a security perspective, because it is impossible to know how exactly this code might behave. Thorough testing is required to ensure the quality and safety, which slows down the development and increases time-to-market. Verifying the correct behavior of any arbitrary code is arguably the ["hardest problem in computer science"](https://blog.paralleluniverse.co/2016/07/23/correctness-and-complexity/) [[67](#9a5521)]. For any decentralized programming model to be successful, the distributed programs needs to be trustworthy and valuable.

The Ambients protocol is based on the principle that decentralized applications building on it can trust that the distributed programs are always compositional, safe, scalable, and decentralized.

The [Compositionality](https://en.wikipedia.org/wiki/Denotational_semantics#Compositionality) of distributed programs guarantees the highest levels of [interoperability](https://en.wikipedia.org/wiki/Conceptual_interoperability). Compositionality is not just about [modularity](https://blog.statebox.org/modularity-vs-compositionality-a-history-of-misunderstandings-be0150033568) [[41](#d2985a)]. It means that the properties of the parts are preserved in the composition. If compositionality holds, safe, scalable, and decentralized programs can be composed together to form a new program which is also safe, scalable, and decentralized. Proving this requires a level of rigor that only mathematical constructions are known to have. In turn, that same rigor guarantees the full understanding of program behavior. This guarantee can turn an untrusted program into a trusted program and is essential for interoperability of decentralized applications and networks.

The [Safety](https://en.wikipedia.org/wiki/Software_system_safety) of distributed programs is an essential property for establishing the trust between applications. We define safety simply as a program behaving exactly as expected. Verifying this again requires mathematical rigor for modeling the expected behavior of programs and specifying the safety properties as logical formulas that can be checked during and after program evaluations. This is essential for establishing the trust between programs.

The [Scalability](https://en.wikipedia.org/wiki/Scalability) of distributed programs increases the value of a decentralized network. Scalability is commonly regarded as the solution to performance issues, but it is also about ensuring that users benefit from being part of the application network. Non-scalable programs eventually become unavailable, making applications using them unavailable and denying the service from users. Scalable programs, in turn, remain available, and in the best case improve, when usage grows which increases the absolute value of the application in a decentralized network. Therefore, verifying that a distributed program scales is essential for the long-term health of a decentralized network and for the success of a decentralized programming model.

Decentralization of distributed programs is not an end goal itself, but a crucial property to enable cooperation in open and permissionless networks while allowing programs to compete. Decentralization distributes the value of programs to all participants and a protocol that is decoupled from its underlying platform allows developers and users to operate on a higher abstraction level and enjoy shared "network effects", while enabling innovation to emerge. In contrast, [as previously discussed](#background), centralized networks require to compete over users and developer mindshare, which eventually converges to the situation as it is right now. To prevent this to happen, deliberate design choices need to be made, such as requiring location-agnostic content-addressing, expecting trust to be proof-based, and guaranteeing open and permissionless network participation.

The Ambients protocol preserves these properties by specifying models for verifying the properties throughout the lifecycle of a distributed program. Detailed in the following chapters, we specify:

1. The [Programming Model](#protocol-primitives) for translating programs to a process-algebraic representation of distributed computation
2. The [Compilation Model](#compilation-model) for compiling programs to distributed executables
3. The [Execution Model](#execution-model) for deploying, executing, and sharing distributed executables in content-addressed, peer-to-peer networks


