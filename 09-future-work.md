# VII. Future Work {future-work}

The Ambients protocol combines efficient and practical distributed systems with safe and formal models of distributed computation, forming a novel approach for building truly decentralized systems.

While the protocol outlined in this paper forms the core of the Ambients protocol, there are various additions and improvements that will be included in the protocol in the future. This section outlines planned future additions and improvements to the protocol, ongoing research and practical development work.

As an open source protocol, future research and development will be performed and coordinated by the Ambients protocol community on GitHub at https://github.com/ambientsprotocol [[9](#9cecfe)].

## Research

Current and future research is focused on improving the protocol capabilities to make the execution model more robust and the programming model more expressive, making emergent system designs possible.

To make the programming model more expressive, there is ongoing research to include additional computation abstractions. These include [conditionals](https://en.wikipedia.org/wiki/Conditional_(computer_programming)) such as _if-else_ statements, the [_ternary_ ](https://en.wikipedia.org/wiki/Ternary_operation) operator and [pattern matching](https://en.wikipedia.org/wiki/Pattern_matching). Together, these abstractions give the end user better expressiveness to handle control flow in their programs.

In order to have more powerful program and data composition primitives, we plan to add computation abstractions for [applicative functors](https://wiki.haskell.org/Applicative_functor) [[10](#e83a80)], [monads](https://wiki.haskell.org/Monad) [[42](#aff2a9)] and [profunctors](http://blog.sigfpe.com/2011/07/profunctors-in-haskell.html) [[5](#05a56a)], and more. In addition, it would be interesting to use [_codata types_ with _copattern matching_](http://www.cse.chalmers.se/~abela/popl13.pdf) [[15](#b93294)] to represent infinitely running programs.

An ambient calculus variant for the Ambients protocol is being researched, to improve the overall efficiency of the protocol. This variant defines the Ambients protocol primitives as ambient calculus primitives, making the protocol encodings simpler and more efficient for the execution environment.

In the future, more research is needed to enable safe optimizations in compilers (inlining, constant folding, etc.) and to use various caching strategies and algorithms in the execution model to improve local versus remote latency. For example, it would be interesting to create a model for optimal resource utilization to maximize the overall network throughput.

## Development

We envision Ambients protocol implementations being used in various environments. This means that development efforts need to focus on making sure there is wide support for underlying operating systems and platforms. Early implementation efforts are focused on covering most common operating systems and hardware architectures as well as supporting web browsers (JavaScript or WASM). In the future, we envision Ambients programs being able to be run on resource-limited devices, such as mobile and IoT devices.

Future development efforts will focus on improving the architecture and features of the virtual machines. For example, we envision VMs being able to do efficient garbage collection, just-in-time compilation of Ambients programs and even to model verifiable compilation.

Compiler development efforts will focus initially on providing support for some commonly used programming languages, such as JavaScript. In the future, we envision adding compiler support for a host of languages that can be used to create Ambients programs. Also, we look forward to improve the compilers by letting them connect to the VMs and participate in the verification process - to make the developer experience friendlier and safer, and to shorten the feedback loop for verifying the correctness of whole program.

As the Ambients protocol gets implemented for various environments, better tools are needed to make life easier for the implementors and researchers. [AmbiCobjs](https://www-sop.inria.fr/mimosa/ambicobjs/) [[8](#e77b77)] has been a crucial tool in designing the protocol so far and we envision a modern version to be implemented that allows simulating, debugging and auditing Ambients programs and the networks they form in real-time. For example, given the nature of the step-wise recording of the execution of Ambients programs, the protocol is well-suited for time-travel debugging and simulation of the programs. Given the mobility of ambients themselves, visualizing the networks and nodes that participate and perform computation would be highly beneficial to better understand and debug the networks and programs.
