// UserEntityToUserDomain.java
package com.faceattend_edu.infrastructure.persistence.mapper.qualifier;

import org.mapstruct.Qualifier;
import java.lang.annotation.*;

@Qualifier
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.CLASS)
public @interface UserEntityToUserDomain {}