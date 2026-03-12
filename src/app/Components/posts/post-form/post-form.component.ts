import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';
import { PostDTO } from '../../../Models/post.dto';

import { formatDate } from '@angular/common';
import { FormGroup, Validators } from '@angular/forms';
import { CategoryDTO } from '../../../Models/category.dto';

type PostFormModel = {
  title: FormControl<string>;
  description: FormControl<string>;
  publication_date: FormControl<string>;
  categories: FormControl<CategoryDTO[]>;
};

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit {
  post: PostDTO;

  title: FormControl<string>;
  description: FormControl<string>;
  publication_date: FormControl<string>;
  categories: FormControl<CategoryDTO[]>;

  postForm: FormGroup<PostFormModel>;
  isValidForm: boolean | null;

  isUpdateMode: boolean;
  validRequest: boolean;
  postId: string | null;

  constructor(
    private activatedRoute: ActivatedRoute,
    private postService: PostService,
    private formBuilder: FormBuilder,
    private router: Router,
    private sharedService: SharedService,
    private localStorageService: LocalStorageService,
    private categoryService: CategoryService,
  ) {
    this.post = new PostDTO('', '', 0, 0, new Date());
    this.isValidForm = null;

    this.postId = '';
    this.isUpdateMode = false;
    this.validRequest = false;

    this.title = new FormControl<string>('', {
      validators: [Validators.required, Validators.maxLength(55)],
      nonNullable: true,
    });
    this.description = new FormControl<string>('', {
      validators: [Validators.required, Validators.maxLength(255)],
      nonNullable: true,
    });
    this.publication_date = new FormControl<string>(
      formatDate(new Date(), 'yyyy-MM-dd', 'en'),
      {
        validators: [Validators.required],
        nonNullable: true,
      },
    );
    this.categories = new FormControl<CategoryDTO[]>([], {
      validators: [Validators.required],
      nonNullable: true,
    });

    this.postForm = this.formBuilder.group({
      title: this.title,
      description: this.description,
      publication_date: this.publication_date,
      categories: this.categories,
    });
  }
  // TODO 13
  async ngOnInit(): Promise<void> {
    let errorResponse: any;
    this.postId = this.activatedRoute.snapshot.paramMap.get('id');

    // update
    if (this.postId) {
      this.isUpdateMode = true;
      try {
        this.post = await this.postService.getPostById(this.postId);

        this.postForm.controls.title.setValue(this.post.title);
        this.postForm.controls.description.setValue(this.post.description);
        this.postForm.controls.publication_date.setValue(
          formatDate(this.post.publication_date, 'yyyy-MM-dd', 'en'),
        );
        this.postForm.controls.categories.setValue(this.post.categories);
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }
    }
  }

  private async editPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    if (this.postId) {
      const userId = this.localStorageService.get('user_id');
      if (userId) {
        this.post.userId = userId;
        try {
          await this.postService.updatePost(
            this.postId,
            this.post,
          );
          responseOK = true;
        } catch (error: any) {
          errorResponse = error.error;
          this.sharedService.errorLog(errorResponse);
        }

        await this.sharedService.managementToast(
          'postFeedback',
          responseOK,
          errorResponse,
        );

        if (responseOK) {
          this.router.navigateByUrl('posts');
        }
      }
    }
    return responseOK;
  }

  private async createPost(): Promise<boolean> {
    let errorResponse: any;
    let responseOK: boolean = false;
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      this.post.userId = userId;
      try {
        await this.postService.createPost(this.post);
        responseOK = true;
      } catch (error: any) {
        errorResponse = error.error;
        this.sharedService.errorLog(errorResponse);
      }

      await this.sharedService.managementToast(
        'postFeedback',
        responseOK,
        errorResponse,
      );

      if (responseOK) {
        this.router.navigateByUrl('posts');
      }
    }

    return responseOK;
  }

  async savePost() {
    this.isValidForm = false;

    if (this.postForm.invalid) {
      return;
    }

    this.isValidForm = true;
    const { title, description, publication_date, categories } =
      this.postForm.getRawValue();
    this.post = new PostDTO(
      title,
      description,
      0,
      0,
      new Date(publication_date),
    );

    if (this.isUpdateMode) {
      this.validRequest = await this.editPost();
    } else {
      this.validRequest = await this.createPost();
    }
  }
}
