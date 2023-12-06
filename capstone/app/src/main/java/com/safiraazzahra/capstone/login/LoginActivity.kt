package com.safiraazzahra.capstone.login

import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Intent
import android.os.Bundle
import android.view.View
import com.safiraazzahra.capstone.databinding.ActivityLoginBinding
import androidx.appcompat.app.AppCompatActivity
import com.safiraazzahra.capstone.R

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        binding = ActivityLoginBinding.inflate(layoutInflater)
        val view = binding.root
        setContentView(view)

        setupView()
        setupAction()
        playAnimation()
    }

    private fun setupAction() {
        binding.loginbutton.setOnClickListener {
            startActivity(Intent(this, LoginActivity::class.java))
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK)
        }
    }

    private fun playAnimation() {
        ObjectAnimator.ofFloat(binding.imageView, View.TRANSLATION_X, -30f, 30f).apply {
            duration = 6000
            repeatCount = ObjectAnimator.INFINITE
            repeatMode = ObjectAnimator.REVERSE
        }.start()

        val register = ObjectAnimator.ofFloat(binding.regisButton, View.ALPHA, 1f).setDuration(100)
        val login = ObjectAnimator.ofFloat(binding.loginbutton, View.ALPHA, 1f).setDuration(100)

        val together = AnimatorSet().apply {
            playTogether(login, register)
        }

        together.start()
    }

    private fun setupView() {
        // Setup your views here if needed
    }
}
