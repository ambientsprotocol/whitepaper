# VIII. Conclusion {conclusion}

We have introduced the Ambients protocol for creating and verifiably executing distributed programs in decentralized, peer-to-peer networks. The main contributions of the protocol are defined in three models: the Programming model, Compilation model and Execution model.

The Ambients Programming model defines the translation of a source program to a distributed program. The Programming model guarantees that if a source program can be defined as pure and total functions and immutable values, it can be transformed to a distributed Ambients program, defined as a composition of protocol primitives. The Ambients Compilation model defines the structure of distributed program executables. The Ambients Execution model defines the control flow of Ambients program deployment and execution in a content-addressed peer-to-peer network, recorded as a Merkle-DAG based event log. The Execution model guarantees the verifiability, authenticity and integrity of the execution of all distributed Ambients programs. The guarantees of all models are enforced and enabled by modeling the deterministic evaluation of programs as a strongly confluent rewrite system based on a process algebra called ambient calculus.

Building on the computational properties and the hybrid distributed evaluation strategies of Ambients, we identify an emerging breed of decentralized applications, such as data structures and databases with shared distributed state, protocols for distributed consensus and program logic, and even digital services with compositional APIs, bridging the centralized and decentralized world.

We look forward to implementing the Ambients protocol as an open-source community and together pursue the vision of a fully, truly, decentralized web.
